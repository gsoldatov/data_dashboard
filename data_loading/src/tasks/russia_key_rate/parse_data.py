import json
import logging
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
    Parses an Excel file with Russia's key rate data into JSON.
    """
    logger = logging.getLogger("airflow.task")

    config = config or get_config()
    data_dir = config.visualization_data_directory
    xlsx_path = data_dir / "russia_key_rate" / "key_rate.xlsx"
    json_path = data_dir / "russia_key_rate" / "key_rate.json"

    logger.info("Parsing Russia key rate xlsx file")

    try:
        if not xlsx_path.is_file():
            raise RuntimeError(
                "Russia key rate xlsx file does not exist"
            )

        logger.debug("Reading xlsx from %s", xlsx_path)

        df = pandas.read_excel(
            xlsx_path,
            sheet_name=0,
            header=0,
        )

        data = _parse(df)

        logger.debug("Writing JSON output to %s", json_path)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info("Saved key rate data to %s", json_path)
    except Exception:
        logger.exception("Failed to parse xlsx file")
        raise


def _parse(df: pandas.DataFrame) -> list[dict[str, Any]]:
    """
    Parses a DataFrame with key rate data.

    Column 0: year_month in mm.yyyy format
    Column 1: key_rate value
    Column 2: inflation_yoy value

    Returns a list of {year_month, key_rate, inflation_yoy} objects,
    sorted chronologically.
    """
    result: list[dict[str, Any]] = []

    for row_idx in range(df.shape[0]):
        month_raw = df.iloc[row_idx, 0]
        key_rate_raw = df.iloc[row_idx, 1]
        inflation_raw = df.iloc[row_idx, 2]

        if pandas.isna(month_raw):
            break

        try:
            year_month = _convert_year_month(str(month_raw).strip())
        except ValueError:
            continue

        entry: dict[str, Any] = {"year_month": year_month}

        if not pandas.isna(key_rate_raw):
            entry["key_rate"] = float(key_rate_raw)

        if not pandas.isna(inflation_raw):
            entry["inflation_yoy"] = float(inflation_raw)

        result.append(entry)

    result.sort(key=lambda e: e["year_month"])

    return result


def _convert_year_month(raw: str) -> str:
    """
    Converts mm.yyyy format to yyyy-mm format.

    Raises ValueError if the input cannot be parsed.
    """
    parts = raw.split(".")
    if len(parts) != 2:
        raise ValueError(f"Cannot parse year_month from: {raw!r}")
    month = int(parts[0])
    year = int(parts[1])
    return f"{year}-{month:02d}"


if __name__ == "__main__":
    parse_data_task.function()
