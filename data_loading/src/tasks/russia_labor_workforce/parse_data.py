import json
import logging
import re
from typing import Any

import pandas
from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from python_common.src import Config, get_config

# Mapping of Russian month names (after footnote cleaning) to month numbers.
_RUS_MONTHS: dict[str, int] = {
    "январь": 1,
    "февраль": 2,
    "март": 3,
    "апрель": 4,
    "май": 5,
    "июнь": 6,
    "июль": 7,
    "август": 8,
    "сентябрь": 9,
    "октябрь": 10,
    "ноябрь": 11,
    "декабрь": 12,
}

# Output JSON field names matching column positions B-G.
_FIELD_NAMES: list[str] = [
    "workforce",
    "employed",
    "unemployed",
    "workforce_share_in_population",
    "employed_share_in_population",
    "unemployed_share_in_workforce",
]


@task
def parse_data_task(config: Config | None = None) -> None:
    """
    Parses an Excel file with Russia's labor workforce data into JSON.
    """
    logger = logging.getLogger("airflow.task")

    config = config or get_config()
    data_dir = config.visualization_data_directory
    xlsx_path = data_dir / "russia_labor_workforce" / "workforce.xlsx"
    json_path = data_dir / "russia_labor_workforce" / "workforce.json"

    logger.info("Parsing Russia labor workforce xlsx file")

    try:
        if not xlsx_path.is_file():
            raise RuntimeError("Russia labor workforce xlsx file does not exist")

        logger.debug("Reading xlsx from %s", xlsx_path)

        # Skip 6 header rows (title + two-row header)
        df = pandas.read_excel(
            xlsx_path,
            sheet_name="5",
            header=None,
            skiprows=6,
        )

        data = _parse(df)

        logger.debug("Writing JSON output to %s", json_path)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info("Saved workforce data to %s", json_path)
    except Exception:
        logger.exception("Failed to parse xlsx file")
        raise


def _parse(df: pandas.DataFrame) -> list[dict[str, Any]]:
    """
    Parses a DataFrame with labor workforce data.

    Column 0: year (4-digit) or month name (Russian, with footnotes)
    Columns 1-6: indicator values

    Returns a list of {year_month, workforce, employed, ...} objects.
    """
    result: list[dict[str, Any]] = []
    current_year: int | None = None

    for row_idx in range(df.shape[0]):
        label_raw = df.iloc[row_idx, 0]

        if pandas.isna(label_raw):
            break

        label = str(label_raw).strip()

        # Year row (4-digit number)
        if re.fullmatch(r"\d{4}", label):
            current_year = int(label)
            continue

        # Month row — clean footnote suffixes and look up month number
        month_name = _clean_month(label)
        month_num = _RUS_MONTHS.get(month_name)
        if month_num is None:
            continue

        if current_year is None:
            continue

        year_month = f"{current_year}-{month_num:02d}"

        entry: dict[str, Any] = {"year_month": year_month}
        for col_idx, field_name in enumerate(_FIELD_NAMES, start=1):
            value_raw = df.iloc[row_idx, col_idx]
            if pandas.isna(value_raw):
                entry[field_name] = None
            else:
                entry[field_name] = float(value_raw)

        result.append(entry)

    return result


def _clean_month(raw: str) -> str:
    """
    Cleans a Russian month name by removing footnote suffixes
    (digits and parentheses, e.g. 'январь1)' -> 'январь',
    'октябрь1)2)' -> 'октябрь').
    """
    # Remove trailing digits and parenthesized numbers
    cleaned = re.sub(r"[\d)]+$", "", raw)
    # Remove any remaining parenthesized groups
    cleaned = re.sub(r"\(\d+\)", "", cleaned)
    return cleaned.strip()


if __name__ == "__main__":
    parse_data_task.function()
