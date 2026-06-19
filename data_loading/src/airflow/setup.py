"""Script for initializing Airflow metadata database."""
import os
import subprocess

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[3]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.airflow.config import configure_airflow
from python_common.src import get_config


def setup_airflow() -> None:
    """Creates and runs Airflow metadata DB migrations."""
    config = get_config()
    configure_airflow(config)
    os.environ["AIRFLOW_HOME"] = str(config.airflow_directory)
    subprocess.run(
        ["uv", "run", "airflow", "db", "migrate"], check=True
    )
    print("Airflow metadata database initialized.")


if __name__ == "__main__":
    setup_airflow()
