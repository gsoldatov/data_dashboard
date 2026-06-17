import logging
import traceback

from prefect import flow

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.helpers import HTTPLoader, get_logger
from python_common.src import Config, get_config


@flow(name="Russia state budget fetch page")
def russia_state_budget_fetch_page(
    config: Config | None = None,
    logger: logging.LoggerAdapter[logging.Logger] | None = None
) -> None:
    """
    Fetches an HTML page with Russia's state budget
    """
    config = config or get_config()
    logger = logger or get_logger(config, "russia_state_budget_fetch_page")

    logger.info("Started Russia state budget download")

    # state budget url
    url="https://minfin.gov.ru/ru/statistics/fedbud/execute?id_57=80041-kratkaya_ezhegodnaya_informatsiya_ob_ispolnenii_federalnogo_byudzheta_mlrd_rub."
    # state + regions budget url
    # url="https://minfin.gov.ru/ru/statistics/conbud/execute?id_57=93449-kratkaya_ezhegodnaya_informatsiya_ob_ispolnenii_konsolidirovannogo_byudzheta_rossiiskoi_federatsii_i_gosudarstvennykh_vnebyudzhetnykh_fondov_mlrd_rub",

    # Ensure save directory
    data_dir = config.visualization_data_directory
    save_path = data_dir / "russia_state_budget" / "budget.html"
    save_path.parent.mkdir(parents=True, exist_ok=True)

    loader = HTTPLoader(url=url, save_path=save_path)

    try:
        loader.load_file()
        logger.info(f"Saved {url} to {str(save_path)}")
    except Exception as e:
        traceback.print_exc()
        logger.error(
            f"An exception occured during file fetch: {str(e)}"
        )


if __name__ == "__main__":
    russia_state_budget_fetch_page.fn()
