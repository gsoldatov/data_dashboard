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
    Parses an Excel file with Russia's average salary data into JSON.
    """
    logger = logging.getLogger("airflow.task")

    config = config or get_config()
    data_dir = config.visualization_data_directory
    xlsx_path = data_dir / "russia_salaries_average" / "salaries.xlsx"
    json_path = data_dir / "russia_salaries_average" / "salaries.json"

    logger.info("Parsing Russia average salaries xlsx file")

    try:
        if not xlsx_path.is_file():
            raise RuntimeError("Russia salaries xlsx file does not exist")

        logger.debug("Reading xlsx from %s", xlsx_path)

        # Read from tab "Лист1", columns A:B (year and value),
        # starting from row 8 (0-indexed skiprows=7)
        df = pandas.read_excel(
            xlsx_path,
            sheet_name="Лист1",
            header=None,
            skiprows=7,
            usecols="A:B",
        )

        data = _parse(df)

        logger.debug("Writing JSON output to %s", json_path)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info("Saved salaries data to %s", json_path)
    except Exception:
        logger.exception("Failed to parse xlsx file")
        raise


def _parse(df: pandas.DataFrame) -> list[dict[str, Any]]:
    """
    Parses a DataFrame with salary data.

    Column 0: years
    Column 1: salary values

    Reads rows until column 0 is NaN or does not contain a valid year.

    Returns a list of {year, value} objects.
    """
    result: list[dict[str, Any]] = []

    for row_idx in range(df.shape[0]):
        year_raw = df.iloc[row_idx, 0]
        value_raw = df.iloc[row_idx, 1]

        if pandas.isna(year_raw):
            break

        try:
            year = _clean_year(year_raw)
        except ValueError:
            break

        if pandas.isna(value_raw):
            continue

        value = _clean_value(value_raw)

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


def _clean_value(raw: Any) -> float:
    """
    Cleans a numeric value by removing spaces and footnote suffixes
    (e.g. '65 338(2)' -> 65338.0).
    """
    text = str(raw).strip()
    # Remove spaces
    text = text.replace(" ", "")
    # Remove footnote suffixes like (1), (2)
    text = re.sub(r"\(\d+\)", "", text)
    return float(text)


if __name__ == "__main__":
    parse_data_task.function()
