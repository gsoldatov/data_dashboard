import asyncio
import traceback

from prefect import flow

if __name__ == "__main__":
    from pathlib import Path
    import sys

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.jobs.base_job import BaseJob
from data_loading.src.helpers import HTTPLoader

from python_common.src import get_config


class RussiaStateBudgetFetchPage(BaseJob):
    """
    Fetches an HTML page with Russia's state budget
    """
    @flow(name="Russia state budget fetch page")
    async def run(self) -> None:
        # state budget url
        url="https://minfin.gov.ru/ru/statistics/fedbud/execute?id_57=80041-kratkaya_ezhegodnaya_informatsiya_ob_ispolnenii_federalnogo_byudzheta_mlrd_rub."
        # state + regions budget url
        # url="https://minfin.gov.ru/ru/statistics/conbud/execute?id_57=93449-kratkaya_ezhegodnaya_informatsiya_ob_ispolnenii_konsolidirovannogo_byudzheta_rossiiskoi_federatsii_i_gosudarstvennykh_vnebyudzhetnykh_fondov_mlrd_rub",

        # Ensure save directory
        save_path = self.config.data_directory / "russia_state_budget" / "budget.html"
        save_path.parent.mkdir(parents=True, exist_ok=True)

        loader = HTTPLoader(url=url, save_path=save_path)

        try:
            await loader.load_file()
            self.log(f"Saved {url} to {str(save_path)}")
        except Exception as e:
            self.log(
                f"An exception occured during file fetch: {str(e)}"
                f"\n{traceback.print_exc()}"
            )


if __name__ == "__main__":
    settings = get_config()
    job = RussiaStateBudgetFetchPage(settings)
    asyncio.run(job.run.fn(job))
