from logging import LoggerAdapter
from pathlib import Path
import sys

if __name__ == "__main__":
    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from prefect import flow
from prefect.context import FlowRunContext

from data_loading.src.jobs.russia_state_budget.fetch_page import russia_state_budget_fetch_page
from data_loading.src.jobs.russia_state_budget.parse_page_data import russia_state_budget_parse_page_data
from data_loading.src.helpers import get_logger
from python_common.src import Config, get_config


@flow(
    name="Russia state budget",
    retries=sys.maxsize,
    retry_delay_seconds=3600
)
def russia_state_budget(
    config: Config | None = None,
    logger: LoggerAdapter | None = None
) -> None:
    """
    Runs all jobs related to Russia's state budget
    """
    config = config or get_config()
    logger = logger or get_logger(config, "russia_state_budget")

    # Use sub-flows if run by Prefect
    if FlowRunContext.get() is not None:
        russia_state_budget_fetch_page(config, logger)
        russia_state_budget_parse_page_data(config, logger)
    
    # Run jobs directly if not run by Prefect
    else:
        russia_state_budget_fetch_page.fn(config, logger)
        russia_state_budget_parse_page_data.fn(config, logger)
    
    logger.info("Finished running Russia state budget job")

if __name__ == "__main__":
    russia_state_budget.fn()
