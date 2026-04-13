import asyncio
from pathlib import Path
import sys

if __name__ == "__main__":
    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from prefect.context import FlowRunContext

from data_loading.src.jobs.base_job import BaseJob
from data_loading.src.jobs.russia_state_budget.fetch_page import RussiaStateBudgetFetchPage
from data_loading.src.jobs.russia_state_budget.parse_page_data import RussiaStateBudgetPagePageData
from python_common.src import get_config


class RussiaStateBudgetJob(BaseJob):
    """
    Runs all jobs related to Russia's state budget
    """
    async def _run(self) -> None:
        # Use sub-flows if run by Prefect
        if FlowRunContext.get() is not None:
            fetch_job = RussiaStateBudgetFetchPage(self.settings)
            await fetch_job.run()

            parse_job = RussiaStateBudgetPagePageData(self.settings)
            await parse_job.run()
        
        # Run jobs directly if not run by Prefect
        else:
            fetch_job = RussiaStateBudgetFetchPage(self.settings)
            await fetch_job.run.fn(fetch_job)

            parse_job = RussiaStateBudgetPagePageData(self.settings)
            await parse_job.run.fn(parse_job)


if __name__ == "__main__":
    settings = get_config()
    job = RussiaStateBudgetJob(settings)
    asyncio.run(job.run.fn(job))