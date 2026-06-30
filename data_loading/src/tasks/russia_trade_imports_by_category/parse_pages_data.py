import json
import logging
import re
from typing import Any

from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from python_common.src import Config, get_config

_RE_COL_DATA = re.compile(r"var col(\d+)\s*=\s*\[\"([^\"]*)\"\]")
_RE_YEAR_MAP = re.compile(r"text:'(\d{4})',\s*datafield:'col(\d+)'")

_THOUSANDS_TO_USD = 1000

_PRODUCT_NAME_MAP: dict[str, str] = {
    "01-05_Animal": "Animal",
    "06-15_Vegetable": "Vegetable",
    "16-24_FoodProd": "Food Products",
    "25-26_Minerals": "Minerals",
    "27-27_Fuels": "Fuels",
    "28-38_Chemicals": "Chemicals",
    "39-40_PlastiRub": "Plastic or Rubber",
    "41-43_HidesSkin": "Hides and Skins",
    "44-49_Wood": "Wood",
    "50-63_TextCloth": "Textiles and Clothing",
    "64-67_Footwear": "Footwear",
    "68-71_StoneGlas": "Stone and Glass",
    "72-83_Metals": "Metals",
    "84-85_MachElec": "Machines and Electronics",
    "86-89_Transport": "Transportation",
    "90-99_Miscellan": "Miscellaneous",
}


@task
def parse_pages_data_task(config: Config | None = None) -> None:
    """
    Parses HTML pages with Russia's import trade data by product category
    into a single JSON file:
    - imports_by_category.json: list of {year, product_category, value}
    """
    logger = logging.getLogger("airflow.task")

    config = config or get_config()
    data_dir = config.visualization_data_directory
    pages_dir = data_dir / "russia_trade_imports_by_category" / "pages"
    output_path = (
        data_dir / "russia_trade_imports_by_category" / "imports_by_category.json"
    )

    logger.info("Parsing Russia trade imports by category HTML pages")

    try:
        if not pages_dir.is_dir():
            raise RuntimeError(
                "Russia trade imports pages directory does not exist"
            )

        page_files = sorted(pages_dir.glob("*.html"))
        if not page_files:
            raise RuntimeError("No HTML page files found in pages directory")

        all_entries: list[dict[str, Any]] = []

        for page_file in page_files:
            product_code = page_file.stem
            product_category = _product_code_to_name(product_code)

            logger.debug("Reading HTML from %s", page_file)
            with open(page_file, encoding="utf-8") as f:
                html_content = f.read()

            entries = _parse_product_page(html_content, product_category)
            logger.debug(
                "Extracted %d entries for %s", len(entries), product_category
            )
            all_entries.extend(entries)

        all_entries.sort(key=lambda e: (e["year"], e["product_category"]))

        logger.debug("Writing JSON output to %s", output_path)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(all_entries, f, ensure_ascii=False, indent=2)

        logger.info(
            "Saved imports by category data: %d entries across %d products",
            len(all_entries),
            len(page_files),
        )
    except Exception:
        logger.exception("Failed to parse HTML pages")
        raise


def _parse_product_page(
    html_content: str, product_category: str
) -> list[dict[str, Any]]:
    """
    Parses a product-category HTML page and returns a list of
    {year, product_category, value} entries.
    """
    col_data: dict[int, str] = {}
    for match in _RE_COL_DATA.finditer(html_content):
        col_num = int(match.group(1))
        value = match.group(2)
        col_data[col_num] = value

    year_map: dict[int, int] = {}
    for match in _RE_YEAR_MAP.finditer(html_content):
        year = int(match.group(1))
        col_num = int(match.group(2))
        year_map[col_num] = year

    if not col_data:
        raise ValueError("No col data arrays found in product page HTML")
    if not year_map:
        raise ValueError("No year-to-column mapping found in product page HTML")

    entries: list[dict[str, Any]] = []
    for col_num, raw_value in col_data.items():
        if col_num == 0:
            continue
        if not raw_value:
            continue

        mapped_year = year_map.get(col_num)
        if mapped_year is None:
            continue

        value = float(raw_value) * _THOUSANDS_TO_USD
        entries.append({
            "year": mapped_year,
            "product_category": product_category,
            "value": value,
        })

    return entries


def _product_code_to_name(product_code: str) -> str:
    """Map a product code like '44-49_Wood' to a human-readable name."""
    name = _PRODUCT_NAME_MAP.get(product_code)
    if name is not None:
        return name
    underscore_idx = product_code.rfind("_")
    if underscore_idx >= 0:
        return product_code[underscore_idx + 1:]
    return product_code


if __name__ == "__main__":
    parse_pages_data_task.function()
