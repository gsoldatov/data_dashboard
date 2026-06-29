import logging
from datetime import date, timedelta
from urllib.parse import quote

from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.helpers import HTTPLoader
from python_common.src import Config, get_config

_URL_TEMPLATE = (
    "https://www.cbr.ru/Queries/UniDbQuery/DownloadExcel/132934"
    "?Posted=True"
    "&FromDate=01%2F01%2F1992"
    "&ToDate={to_date}"
)


@task
def fetch_file_task(config: Config | None = None) -> None:
    """
    Fetches an Excel file with Russia's key rate data.

    The URL includes a ToDate parameter dynamically set to yesterday,
    reflecting the latest available data from the CBR.
    """
    logger = logging.getLogger("airflow.task")
    config = config or get_config()

    yesterday = date.today() - timedelta(days=1)
    to_date_raw = yesterday.strftime("%m/%d/%Y")
    to_date_encoded = quote(to_date_raw, safe="")
    url = _URL_TEMPLATE.format(to_date=to_date_encoded)

    logger.info("Fetching Russia key rate xlsx from %s", url)

    data_dir = config.visualization_data_directory
    save_path = data_dir / "russia_key_rate" / "key_rate.xlsx"
    logger.debug("Ensuring output directory %s exists", save_path.parent)
    save_path.parent.mkdir(parents=True, exist_ok=True)

    loader = HTTPLoader(url=url, save_path=save_path, verify=False)

    try:
        loader.load_file()
        logger.info("Saved xlsx file to %s", save_path)
    except Exception:
        logger.exception("Failed to fetch xlsx file")
        raise


if __name__ == "__main__":
    fetch_file_task.function()
