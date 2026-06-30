import sys
from pathlib import Path

import pendulum
from airflow.sdk import dag, task

# Project root is needed is sys.path for Airflow
# to properly process the file when looking for dags
PROJECT_ROOT = str(Path(__file__).parents[3])
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_trade_imports.fetch_page import fetch_page_task
from data_loading.src.tasks.russia_trade_imports.parse_page_data import (
    parse_page_data_task,
)
from python_common.src import get_config

DAG_ID = "russia_trade_imports"


@dag(
    dag_id=DAG_ID,
    schedule="@weekly",
    start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
    catchup=False,
    tags=["russia_trade_imports"],
)
def russia_trade_imports_dag() -> None:
    config = get_config()

    fetch_page_task(config) >> parse_page_data_task(config)


russia_trade_imports = russia_trade_imports_dag()


if __name__ == "__main__":
    import os
    import subprocess

    config = get_config()
    os.environ["AIRFLOW_HOME"] = str(config.airflow_directory)

    exit_code = subprocess.call(["uv", "run", "airflow", "dags", "test", DAG_ID])
    sys.exit(exit_code)
