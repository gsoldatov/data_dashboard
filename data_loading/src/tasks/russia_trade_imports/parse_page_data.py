import json
import logging

from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.helpers.parsing.worldbank_wits_russia_trade import (
    parse_by_country_page,
)
from python_common.src import Config, get_config


@task
def parse_page_data_task(config: Config | None = None) -> None:
    """
    Parses an HTML page with Russia's import trade data into JSON files:
    - imports_by_country.json: list of {year, country, value}
    - imports_yearly_totals.json: list of {year, value}
    """
    logger = logging.getLogger("airflow.task")

    config = config or get_config()
    data_dir = config.visualization_data_directory
    page_path = data_dir / "russia_trade_imports" / "page.html"
    by_country_path = data_dir / "russia_trade_imports" / "imports_by_country.json"
    totals_path = data_dir / "russia_trade_imports" / "imports_yearly_totals.json"

    logger.info("Parsing Russia trade imports HTML page")

    try:
        if not page_path.is_file():
            raise RuntimeError("Russia trade imports HTML file does not exist")

        logger.debug("Reading HTML from %s", page_path)
        with open(page_path, encoding="utf-8") as f:
            html_content = f.read()

        by_country, totals = parse_by_country_page(html_content)

        logger.debug("Writing by-country JSON output to %s", by_country_path)
        with open(by_country_path, "w", encoding="utf-8") as f:
            json.dump(by_country, f, ensure_ascii=False, indent=2)

        logger.debug("Writing yearly totals JSON output to %s", totals_path)
        with open(totals_path, "w", encoding="utf-8") as f:
            json.dump(totals, f, ensure_ascii=False, indent=2)

        logger.info(
            "Saved trade imports data: %d by-country entries, %d yearly totals",
            len(by_country),
            len(totals),
        )
    except Exception:
        logger.exception("Failed to parse HTML page")
        raise


if __name__ == "__main__":
    parse_page_data_task.function()
