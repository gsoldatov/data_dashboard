import json
import logging

from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.helpers.parsing.worldbank_wits_russia_trade import (
    parse_product_page,
    product_code_to_name,
)
from python_common.src import Config, get_config


@task
def parse_pages_data_task(config: Config | None = None) -> None:
    """
    Parses HTML pages with Russia's export trade data by product category
    into a single JSON file:
    - exports_by_category.json: list of {year, product_category, value}
    """
    logger = logging.getLogger("airflow.task")

    config = config or get_config()
    data_dir = config.visualization_data_directory
    pages_dir = data_dir / "russia_trade_exports_by_category" / "pages"
    output_path = (
        data_dir / "russia_trade_exports_by_category" / "exports_by_category.json"
    )

    logger.info("Parsing Russia trade exports by category HTML pages")

    try:
        if not pages_dir.is_dir():
            raise RuntimeError(
                "Russia trade exports pages directory does not exist"
            )

        page_files = sorted(pages_dir.glob("*.html"))
        if not page_files:
            raise RuntimeError("No HTML page files found in pages directory")

        all_entries: list[dict[str, object]] = []

        for page_file in page_files:
            product_code = page_file.stem
            product_category = product_code_to_name(product_code)

            logger.debug("Reading HTML from %s", page_file)
            with open(page_file, encoding="utf-8") as f:
                html_content = f.read()

            entries = parse_product_page(html_content, product_category)
            logger.debug(
                "Extracted %d entries for %s", len(entries), product_category
            )
            all_entries.extend(entries)

        all_entries.sort(key=lambda e: (e["year"], e["product_category"]))

        logger.debug("Writing JSON output to %s", output_path)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(all_entries, f, ensure_ascii=False, indent=2)

        logger.info(
            "Saved exports by category data: %d entries across %d products",
            len(all_entries),
            len(page_files),
        )
    except Exception:
        logger.exception("Failed to parse HTML pages")
        raise


if __name__ == "__main__":
    parse_pages_data_task.function()
