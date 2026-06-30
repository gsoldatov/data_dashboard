"""
Fetch HTML pages with Russia's import trade data by product category.

Product categories
------------------
The WITS CountryProfile page offers 27+ product groupings across multiple
classification schemes (HS groups, SITC Rev2, Sector, Stages of Processing)
selectable via the "Product Group" filter.  The 16 HS-based categories
fetched here come from the "Quick links" section and exclude overlapping
entries from other schemes (e.g. "Chemical" / "Chemicals", "Fuels" / "Fuel",
"Transp" / "Machinery and Transport Equipment") as well as the "All Products"
aggregate.

Yearly totals vs. by-country data
---------------------------------
The by-category sums (World partner) differ from the by-country yearly
totals for imports, especially in early years:

  - 1996–1997: +26–33 % (by-category higher)
  - 1998+:     +0.3–4 %

The likely cause is that the World aggregate includes trade not captured
by individual country entries in the BY-COUNTRY view.  Exports do not show
this discrepancy.
"""

import logging
import re
import time
from datetime import datetime

import httpx
from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.helpers import HTTPLoader
from python_common.src import Config, get_config

_RE_PRODUCT_CODE = re.compile(r"Product/([^\"'&\s]+)")
_EXCLUDED_PRODUCTS: frozenset[str] = frozenset({"Total"})


@task
def fetch_pages_task(config: Config | None = None) -> None:
    """
    Fetches HTML pages with Russia's import trade data by product category
    from WITS (World Integrated Trade Solution).
    """
    logger = logging.getLogger("airflow.task")
    config = config or get_config()

    data_dir = config.visualization_data_directory
    pages_dir = data_dir / "russia_trade_imports_by_category" / "pages"
    pages_dir.mkdir(parents=True, exist_ok=True)

    current_year = datetime.now().year

    product_codes = _get_product_codes(logger)
    logger.info("Found %d product categories", len(product_codes))

    for i, product_code in enumerate(product_codes):
        url = (
            "https://wits.worldbank.org/CountryProfile/en/Country/RUS"
            "/StartYear/1992/EndYear/"
            f"{current_year}"
            "/TradeFlow/Import/Indicator/MPRT-TRD-VL/Partner/WLD"
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


def _get_product_codes(logger: logging.Logger) -> list[str]:
    """Extract product category codes from the RUS country profile page."""
    rus_url = "https://wits.worldbank.org/CountryProfile/en/RUS"

    logger.info("Fetching RUS country profile to extract product codes")
    with httpx.Client() as client:
        response = client.get(rus_url)
        response.raise_for_status()
        html = response.text

    codes = sorted(set(_RE_PRODUCT_CODE.findall(html)) - _EXCLUDED_PRODUCTS)
    logger.debug("Product codes: %s", codes)
    return codes


if __name__ == "__main__":
    fetch_pages_task.function()
