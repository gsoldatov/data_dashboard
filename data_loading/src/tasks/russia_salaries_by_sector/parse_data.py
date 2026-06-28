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

# Sector names to extract (matched after stripping against spreadsheet rows).
_TARGET_SECTORS: set[str] = {
    "сельское, лесное хозяйство, охота, рыболовство и рыбоводство",
    "добыча полезных ископаемых",
    "обрабатывающие производства",
    "обеспечение электрической энергией, газом и паром; кондиционирование воздуха",
    "водоснабжение; водоотведение, организация сбора и утилизации отходов," +
        " деятельность по ликвидации загрязнений",
    "строительство",
    "торговля оптовая и розничная; ремонт автотранспортных средств и мотоциклов",
    "транспортировка и хранение",
    "деятельность гостиниц и предприятий общественного питания",
    "деятельность в области информации и связи",
    "деятельность финансовая и страховая",
    "деятельность по операциям с недвижимым имуществом",
    "деятельность профессиональная,научная и техническая",
    "деятельность административная и сопутствующие дополнительные услуги",
    "государственное управление и обеспечение военной безопасности;" +
        " социальное обеспечение",
    "образование",
    "деятельность в области здравоохранения и социальных услуг",
    "деятельность в области культуры, спорта, организации досуга и развлечений",
}


@task
def parse_data_task(config: Config | None = None) -> None:
    """
    Parses an Excel file with Russia's salary-by-sector data into JSON.
    """
    logger = logging.getLogger("airflow.task")

    config = config or get_config()
    data_dir = config.visualization_data_directory
    xlsx_path = data_dir / "russia_salaries_by_sector" / "salaries.xlsx"
    json_path = data_dir / "russia_salaries_by_sector" / "salaries.json"

    logger.info("Parsing Russia salaries by sector xlsx file")

    try:
        if not xlsx_path.is_file():
            raise RuntimeError("Russia salaries by sector xlsx file does not exist")

        logger.debug("Reading xlsx from %s", xlsx_path)

        # Headers (years) are on row 5 (0-indexed header=4)
        df = pandas.read_excel(
            xlsx_path,
            sheet_name="с 2017 г.",
            header=4,
        )

        # Column 0 is sector names, columns 1+ are yearly values
        year_columns = list(df.columns[1:])
        data = _parse(df, year_columns)

        logger.debug("Writing JSON output to %s", json_path)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info("Saved salaries by sector data to %s", json_path)
    except Exception:
        logger.exception("Failed to parse xlsx file")
        raise


def _parse(
    df: pandas.DataFrame,
    year_columns: list[Any],
) -> list[dict[str, Any]]:
    """
    Parses a DataFrame with salary-by-sector data.

    Column 0: sector names
    Columns 1+: yearly salary values (headers are year labels)

    Returns a list of {year, sector, value} objects.
    """
    result: list[dict[str, Any]] = []

    # Extract years from column headers (cleaning footnotes)
    years: list[int] = []
    for col in year_columns:
        years.append(_clean_year(col))

    for row_idx in range(df.shape[0]):
        sector_raw = df.iloc[row_idx, 0]

        if pandas.isna(sector_raw):
            break

        sector = str(sector_raw).strip()
        if sector not in _TARGET_SECTORS:
            continue

        for col_idx, year in enumerate(years):
            value_raw = df.iloc[row_idx, col_idx + 1]
            if pandas.isna(value_raw):
                continue
            value = _clean_value(value_raw)
            result.append({"year": year, "sector": sector, "value": value})

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
