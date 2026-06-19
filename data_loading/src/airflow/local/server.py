"""Script for starting local Airflow server."""
import os
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).parents[4]
sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.airflow.config import configure_airflow
from python_common.src import get_config

if __name__ == "__main__":
    config = get_config()
    configure_airflow(config)
    os.environ["AIRFLOW_HOME"] = str(config.airflow_directory)

    # Start API server
    api_process = subprocess.Popen([
        "uv", "run", "airflow", "api-server",
        "--host", config.airflow_host,
        "--port", str(config.airflow_port),
    ])

    # Start scheduler
    scheduler_process = subprocess.Popen([
        "uv", "run", "airflow", "scheduler",
    ])

    print(f"Airflow API server: http://{config.airflow_host}:{config.airflow_port}")
    print("Airflow scheduler started.")

    try:
        api_process.wait()
        scheduler_process.wait()
    except KeyboardInterrupt:
        print("\nShutting down Airflow...")
        api_process.terminate()
        scheduler_process.terminate()
        api_process.wait()
        scheduler_process.wait()
