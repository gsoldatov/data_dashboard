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


@task
def parse_data_task(config: Config | None = None) -> None:
    """
    Parses an Excel file with Russia's GDP data into JSON.
    """
    logger = logging.getLogger("airflow.task")

    config = config or get_config()
    data_dir = config.visualization_data_directory
    xlsx_path = data_dir / "russia_gdp_constant_prices_rub" / "gdp.xlsx"
    json_path = data_dir / "russia_gdp_constant_prices_rub" / "gdp.json"

    logger.info("Parsing Russia GDP xlsx file")

    try:
        if not xlsx_path.is_file():
            raise RuntimeError("Russia GDP xlsx file does not exist")

        logger.debug("Reading xlsx from %s", xlsx_path)

        # Read rows 3-4 (0-indexed: rows 2-3), columns A-O (0-14)
        # from tab "6"
        df = pandas.read_excel(
            xlsx_path,
            sheet_name="6",
            header=None,
            skiprows=2,
            nrows=2,
            usecols="A:O",
        )

        data = _parse(df)

        logger.debug("Writing JSON output to %s", json_path)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info("Saved GDP data to %s", json_path)
    except Exception:
        logger.exception("Failed to parse xlsx file")
        raise


def _parse(df: pandas.DataFrame) -> list[dict[str, Any]]:
    """
    Parses a DataFrame with GDP data.

    Row 0 (original row 3): years
    Row 1 (original row 4): GDP values

    Returns a list of {year, value} objects.
    """
    if df.shape[0] < 2:
        raise ValueError(
            f"Expected at least 2 rows in GDP data, got {df.shape[0]}"
        )

    years_row = df.iloc[0]
    values_row = df.iloc[1]

    result: list[dict[str, Any]] = []

    for col_idx in range(df.shape[1]):
        year_raw = years_row.iloc[col_idx]
        value_raw = values_row.iloc[col_idx]

        if pandas.isna(year_raw) or pandas.isna(value_raw):
            continue

        year = _clean_year(year_raw)
        value = float(value_raw)

        result.append({"year": year, "value": value})

    return result


def _clean_year(raw: Any) -> int:
    """
    Cleans a year value by removing footnotes (non-numeric suffixes)
    and converting to int.
    """
    text = str(raw).strip()
    # Extract leading 4-digit year, ignoring any trailing footnote text
    match = re.match(r"(\d{4})", text)
    if match is None:
        raise ValueError(f"Cannot extract year from: {text!r}")
    return int(match.group(1))


if __name__ == "__main__":
    parse_data_task.function()
