"""
Fetch HTML pages with Russia's export trade data by product category.

For notes on product categories and yearly-total discrepancies see
``data_loading.src.helpers.fetching.worldbank_wits_russia_trade``.
"""

import logging
import time
from datetime import datetime

from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.helpers import HTTPLoader
from data_loading.src.helpers.fetching.worldbank_wits_russia_trade import (
    get_product_codes,
)
from python_common.src import Config, get_config


@task
def fetch_pages_task(config: Config | None = None) -> None:
    """
    Fetches HTML pages with Russia's export trade data by product category
    from WITS (World Integrated Trade Solution).
    """
    logger = logging.getLogger("airflow.task")
    config = config or get_config()

    data_dir = config.visualization_data_directory
    pages_dir = data_dir / "russia_trade_exports_by_category" / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)

    current_year = datetime.now().year

    product_codes = get_product_codes(logger)
    logger.info("Found %d product categories", len(product_codes))

    for i, product_code in enumerate(product_codes):
        url = (
            "https://wits.worldbank.org/CountryProfile/en/Country/RUS"
            "/StartYear/1992/EndYear/"
            f"{current_year}"
            "/TradeFlow/Export/Indicator/XPRT-TRD-VL/Partner/WLD"
            f"/Product/{product_code}"
        )
        save_path = pages_dir / f"{product_code}.html"

        logger.info(
            "Fetching product page %d/%d: %s",
            i + 1,
            len(product_codes),
            product_code,
        )
        logger.debug("URL: %s", url)

        loader = HTTPLoader(url=url, save_path=save_path)

        try:
            loader.load_file()
            logger.info("Saved HTML page to %s", save_path)
        except Exception:
            logger.exception("Failed to fetch HTML page for %s", product_code)
            raise

        if i < len(product_codes) - 1:
            time.sleep(1.5)


if __name__ == "__main__":
    fetch_pages_task.function()
