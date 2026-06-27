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
    Parses the World Bank GDP CSV into JSON.
    """
    logger = logging.getLogger("airflow.task")

    config = config or get_config()
    data_dir = config.visualization_data_directory
    csv_path = data_dir / "russia_gdp_constant_prices_usd" / "gdp.csv"
    json_path = data_dir / "russia_gdp_constant_prices_usd" / "gdp.json"

    logger.info("Parsing World Bank GDP CSV file")

    try:
        if not csv_path.is_file():
            raise RuntimeError("World Bank GDP CSV file does not exist")

        logger.debug("Reading CSV from %s", csv_path)

        # First 4 rows (0-3) are metadata; row 4 is headers
        df = pandas.read_csv(csv_path, skiprows=4)

        data = _parse(df)

        logger.debug("Writing JSON output to %s", json_path)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info("Saved GDP data to %s", json_path)
    except Exception:
        logger.exception("Failed to parse CSV file")
        raise


def _parse(df: pandas.DataFrame) -> list[dict[str, Any]]:
    """
    Parses a DataFrame with World Bank GDP data.

    Filters by country code 'RUS', extracts year columns
    with non-empty values, and returns a list of {year, value} objects.
    """
    if "Country Code" not in df.columns:
        raise ValueError(
            "Expected 'Country Code' column in CSV, got: "
            + str(list(df.columns))
        )

    rus_rows = df[df["Country Code"] == "RUS"]
    if rus_rows.empty:
        raise ValueError("No row with Country Code 'RUS' found in CSV")

    row = rus_rows.iloc[0]

    # Year columns are those whose header is a 4-digit number
    result: list[dict[str, Any]] = []

    for col in df.columns:
        # Skip known non-year columns
        if col in ("Country Name", "Country Code",
                   "Indicator Name", "Indicator Code"):
            continue

        value = row[col]
        if pandas.isna(value):
            continue

        try:
            year = int(str(col))
        except (ValueError, TypeError):
            continue

        result.append({"year": year, "value": float(value)})

    return result


if __name__ == "__main__":
    parse_data_task.function()
