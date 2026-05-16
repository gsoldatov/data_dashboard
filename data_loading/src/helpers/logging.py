import logging
from datetime import datetime
from typing import cast

from prefect.context import FlowRunContext
from prefect.logging import get_run_logger

from python_common.src import Config


def get_logger(
    config: Config,
    job_name: str
) -> logging.LoggerAdapter:
    """
    Configures & returns a job logger
    """
    # Use Prefect's of default logger, depending 
    # in whether inside a flow run
    is_in_flow_run = FlowRunContext.get() is not None
    if is_in_flow_run:
        adapter = cast(logging.LoggerAdapter, get_run_logger())
    else:
        logger = logging.getLogger(job_name)
        logger.setLevel(logging.INFO)   # enable writing INFO to stderr
        adapter = logging.LoggerAdapter(
            logger,
            extra={
                "job_name": job_name
            }
        )
    
    # Add a file handler
    if config.data_loading_log_mode == "file":
        # A safeguard, which removes any existing file handlers,
        # if they're not removed from a previous run
        # (this does not happen every run, but who knows)
        for handler in adapter.logger.handlers:
            if isinstance(handler, logging.FileHandler):
                adapter.logger.removeHandler(handler)

        log_path = config.logs_directory / "data_loading"
        log_path.mkdir(parents=True, exist_ok=True)
        now = datetime.now().strftime("%Y_%m_%d_%H_%M_%S")
        log_path /= f"{job_name}_{now}.log"
        handler = logging.FileHandler(log_path)

        # Add default flow run format (or similar when running without Prefect)
        if is_in_flow_run:
            fmt = (
                "%(asctime)s.%(msecs)03d"
                " | %(levelname)-7s"
                " | Flow run %(flow_run_name)r - %(message)s"
            )
        else:
            fmt = (
                "%(asctime)s.%(msecs)03d"
                " | %(levelname)-7s"
                " | %(job_name)s - %(message)s"
            )
        
        handler.setFormatter(logging.Formatter(fmt))

        adapter.logger.addHandler(handler)
        
    return adapter
