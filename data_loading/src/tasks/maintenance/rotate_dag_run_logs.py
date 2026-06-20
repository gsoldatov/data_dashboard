import logging
import shutil
from pathlib import Path

import pendulum
from airflow.sdk import task

if __name__ == "__main__":
    import sys

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from python_common.src import Config, get_config


@task
def rotate_dag_run_logs_task(config: Config | None = None) -> None:
    """
    Rotates DAG run log directories, keeping only the N most recent runs per DAG.
    """
    logger = logging.getLogger("airflow.task")
    config = config or get_config()

    n = config.airflow_logging_number_of_dag_runs_kept
    logs_dir = config.airflow_directory / "logs"

    if not logs_dir.exists():
        logger.info(
            "DAG run logs directory %s does not exist, nothing to rotate",
            logs_dir,
        )
        return

    logger.info(
        "Rotating DAG run logs (keeping %d latest run%s per DAG)",
        n,
        "" if n == 1 else "s",
    )

    for dag_dir in sorted(logs_dir.iterdir()):
        if not dag_dir.is_dir() or not dag_dir.name.startswith("dag_id="):
            continue

        run_dirs = [
            d for d in dag_dir.iterdir()
            if d.is_dir() and d.name.startswith("run_id=")
        ]
        if len(run_dirs) <= n:
            continue

        dag_name = dag_dir.name[len("dag_id="):]
        logger.debug(
            "DAG %s has %d run dirs (keeping %d)",
            dag_name,
            len(run_dirs),
            n,
        )

        def _parse_timestamp(dir_path: Path) -> pendulum.DateTime | None:
            name = dir_path.name[len("run_id="):]
            sep = name.find("__")
            if sep == -1:
                return None
            ts_str = name[sep + 2:]
            if not ts_str:
                return None
            try:
                result = pendulum.parse(ts_str)
                if isinstance(result, pendulum.DateTime):
                    return result
                return None
            except (pendulum.parsing.exceptions.ParserError, ValueError):
                return None

        parsed: list[tuple[Path, pendulum.DateTime]] = []
        for rd in run_dirs:
            ts = _parse_timestamp(rd)
            if ts is not None:
                parsed.append((rd, ts))

        parsed.sort(key=lambda item: item[1], reverse=True)

        for rd, _ in parsed[n:]:
            logger.info("Removing old DAG run logs: %s", rd)
            shutil.rmtree(rd)


if __name__ == "__main__":
    rotate_dag_run_logs_task.function()
