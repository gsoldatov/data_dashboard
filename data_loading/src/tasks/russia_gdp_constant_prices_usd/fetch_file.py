import logging
import tempfile
from zipfile import ZipFile

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
    Fetches a zip archive with World Bank GDP data and extracts
    the CSV file for indicator NY.GDP.MKTP.KD.
    """
    logger = logging.getLogger("airflow.task")
    config = config or get_config()

    url = (
        "https://api.worldbank.org/v2/en/indicator"
        "/NY.GDP.MKTP.KD?downloadformat=csv"
    )

    logger.info("Fetching World Bank GDP zip from %s", url)

    data_dir = config.visualization_data_directory
    save_path = data_dir / "russia_gdp_constant_prices_usd" / "gdp.csv"
    logger.debug("Ensuring output directory %s exists", save_path.parent)
    save_path.parent.mkdir(parents=True, exist_ok=True)

    zip_path: Path | None = None

    try:
        with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
            zip_path = Path(tmp.name)

        loader = HTTPLoader(url=url, save_path=zip_path)
        loader.load_file()
        logger.info("Downloaded zip to %s", zip_path)

        _extract(logger, zip_path, save_path)
        logger.info("Saved CSV to %s", save_path)
    finally:
        # Clean up temp zip file
        if zip_path is not None and zip_path.exists():
            zip_path.unlink(missing_ok=True)

    logger.info("Fetch completed successfully")


def _extract(
    logger: logging.Logger,
    zip_path: Path,
    dest_path: Path,
) -> None:
    """
    Extracts the CSV file starting with 'API_NY.GDP.MKTP.KD'
    from the zip archive and saves it to dest_path.
    """
    prefix = "API_NY.GDP.MKTP.KD"

    with ZipFile(zip_path, "r") as zf:
        # Find the entry whose filename starts with the expected prefix
        matching = [
            name for name in zf.namelist()
            if Path(name).name.startswith(prefix)
        ]

        if not matching:
            entries = zf.namelist()
            raise RuntimeError(
                f"No entry starting with {prefix!r} found in archive. "
                f"Entries: {entries}"
            )

        if len(matching) > 1:
            logger.warning(
                "Multiple matches found: %s; using first: %s",
                matching,
                matching[0],
            )

        source_name = matching[0]
        logger.debug("Extracting %s from zip", source_name)

        with zf.open(source_name) as src:
            with open(dest_path, "wb") as dst:
                dst.write(src.read())


if __name__ == "__main__":
    fetch_file_task.function()
