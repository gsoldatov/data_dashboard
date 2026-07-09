import sys
from datetime import timedelta
from pathlib import Path

import pendulum
from airflow.sdk import dag, task

# Project root is needed is sys.path for Airflow
# to properly process the file when looking for dags
PROJECT_ROOT = str(Path(__file__).parents[3])
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_gdp_constant_prices_usd.fetch_file import (
    fetch_file_task,
)
from data_loading.src.tasks.russia_gdp_constant_prices_usd.parse_data import (
    parse_data_task,
)
from python_common.src import get_config

DAG_ID = "russia_gdp_constant_prices_usd"


@dag(
    dag_id=DAG_ID,
    schedule="@weekly",
    default_args={"retries": 3, "retry_delay": timedelta(days=1)},
    start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
    # auto-enabling tasks results in a timeout of the first scheduled run
    # due to local executor being unable to connect with the api in time
    # is_paused_upon_creation=False,
    catchup=False,
    tags=["russia_gdp_constant_prices_usd"],
)
def russia_gdp_constant_prices_usd_dag() -> None:
    config = get_config()

    fetch_file_task(config) >> parse_data_task(config)


russia_gdp_constant_prices_usd = russia_gdp_constant_prices_usd_dag()


if __name__ == "__main__":
    import os
    import subprocess

    config = get_config()
    os.environ["AIRFLOW_HOME"] = str(config.airflow_directory)

    exit_code = subprocess.call(
        ["uv", "run", "airflow", "dags", "test", DAG_ID]
    )
    sys.exit(exit_code)
