import logging

from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.helpers import HTTPLoader
from python_common.src import Config, get_config


@task
def fetch_file_task(config: Config | None = None) -> None:
    """
    Fetches an Excel file with Russia's average salary data.

    Source: https://rosstat.gov.ru/labor_market_employment_salaries
    (Среднемесячная номинальная начисленная заработная плата работников в
    целом по экономике Российской Федерации в ...-... гг.)
    """
    logger = logging.getLogger("airflow.task")
    config = config or get_config()

    url = "https://rosstat.gov.ru/storage/mediabank/tab1-zpl_06-2026.xlsx"

    logger.info("Fetching Russia average salaries xlsx from %s", url)

    data_dir = config.visualization_data_directory
    save_path = data_dir / "russia_salaries_average" / "salaries.xlsx"
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
