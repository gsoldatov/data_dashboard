import sys
from pathlib import Path

import pendulum
from airflow.sdk import dag

# Project root is needed is sys.path for Airflow
# to properly process the file when looking for dags
PROJECT_ROOT = str(Path(__file__).parents[3])
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.maintenance.rotate_dag_processor_logs import (
    rotate_dag_processor_logs_task,
)
from data_loading.src.tasks.maintenance.rotate_dag_run_logs import (
    rotate_dag_run_logs_task,
)
from python_common.src import get_config

DAG_ID = "maintenance"


@dag(
    dag_id=DAG_ID,
    schedule="@daily",
    start_date=pendulum.datetime(2026, 1, 1, tz="UTC"),
    catchup=False,
    tags=["maintenance"],
)
def maintenance_dag() -> None:
    config = get_config()

    rotate_dag_run_logs_task(config) >> rotate_dag_processor_logs_task(config)


maintenance = maintenance_dag()


if __name__ == "__main__":
    import os
    import subprocess

    config = get_config()
    os.environ["AIRFLOW_HOME"] = str(config.airflow_directory)

    exit_code = subprocess.call(["uv", "run", "airflow", "dags", "test", DAG_ID])
    sys.exit(exit_code)
