import logging
from datetime import datetime

from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.helpers import HTTPLoader
from python_common.src import Config, get_config


@task
def fetch_page_task(config: Config | None = None) -> None:
    """
    Fetches an HTML page with Russia's import trade data by partner country
    from WITS (World Integrated Trade Solution).
    """
    logger = logging.getLogger("airflow.task")
    config = config or get_config()

    current_year = datetime.now().year
    url = (
        "https://wits.worldbank.org/CountryProfile/en/Country/RUS"
        "/StartYear/1992/EndYear/"
        f"{current_year}"
        "/TradeFlow/Import/Partner/BY-COUNTRY/Indicator/MPRT-TRD-VL"
    )

    logger.info("Fetching Russia trade imports page from %s", url)

    data_dir = config.visualization_data_directory
    save_path = data_dir / "russia_trade_imports" / "page.html"
    logger.debug("Ensuring output directory %s exists", save_path.parent)
    save_path.parent.mkdir(parents=True, exist_ok=True)

    loader = HTTPLoader(url=url, save_path=save_path)

    try:
        loader.load_file()
        logger.info("Saved HTML page to %s", save_path)
    except Exception:
        logger.exception("Failed to fetch HTML page")
        raise


if __name__ == "__main__":
    fetch_page_task.function()
