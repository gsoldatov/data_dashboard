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


@task
def parse_data_task(config: Config | None = None) -> None:
    """
    Parses an Excel file with Russia's consumer price index data into JSON.
    """
    logger = logging.getLogger("airflow.task")

    config = config or get_config()
    data_dir = config.visualization_data_directory
    xlsx_path = data_dir / "russia_consumer_price_index" / "cpi.xlsx"
    json_path = data_dir / "russia_consumer_price_index" / "cpi.json"

    logger.info("Parsing Russia consumer price index xlsx file")

    try:
        if not xlsx_path.is_file():
            raise RuntimeError(
                "Russia consumer price index xlsx file does not exist"
            )

        logger.debug("Reading xlsx from %s", xlsx_path)

        # Skip 3 rows so data starts at Excel row 4:
        #   row 0 → Excel row 4 (years)
        #   row 1 → Excel row 5 (text, skipped)
        #   rows 2-13 → Excel rows 6-17 (month data)
        df = pandas.read_excel(
            xlsx_path,
            sheet_name="01",
            header=None,
            skiprows=3,
        )

        data = _parse(df)

        logger.debug("Writing JSON output to %s", json_path)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info("Saved consumer price index data to %s", json_path)
    except Exception:
        logger.exception("Failed to parse xlsx file")
        raise


def _parse(df: pandas.DataFrame) -> list[dict[str, Any]]:
    """
    Parses a DataFrame with CPI pivot table data.

    Row 0: years in columns 1..N (column 0 is blank)
    Row 1: text, skipped
    Rows 2-13: month names in column 0, CPI values in columns 1..N

    Returns a list of {year_month, value} objects.
    """
    # Extract years from row 0, columns 1+
    years: list[int] = []
    for col_idx in range(1, df.shape[1]):
        val = df.iloc[0, col_idx]
        if pandas.isna(val):
            break
        years.append(int(val))

    result: list[dict[str, Any]] = []

    # Process month rows (rows 2-13, i.e. up to 12 months)
    for row_idx in range(2, min(df.shape[0], 14)):
        month_raw = df.iloc[row_idx, 0]

        if pandas.isna(month_raw):
            break

        month_name = _clean_month(str(month_raw).strip())
        month_num = _RUS_MONTHS.get(month_name)
        if month_num is None:
            continue

        for col_idx, year in enumerate(years, start=1):
            value_raw = df.iloc[row_idx, col_idx]
            if pandas.isna(value_raw):
                continue

            result.append(
                {
                    "year_month": f"{year}-{month_num:02d}",
                    "value": float(value_raw),
                }
            )

    result.sort(key=lambda e: e["year_month"])

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
