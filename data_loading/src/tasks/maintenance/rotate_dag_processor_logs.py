import logging
import shutil

from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from python_common.src import Config, get_config


@task
def rotate_dag_processor_logs_task(config: Config | None = None) -> None:
    """
    Rotates DAG processor log directories, keeping only the N most recent days.
    """
    logger = logging.getLogger("airflow.task")
    config = config or get_config()

    n = config.airflow_logging_number_of_dag_processor_days_kept
    dp_logs_dir = config.airflow_directory / "logs" / "dag_processor"

    logger.info(
        "Rotating DAG processor logs (keeping %d latest day%s)",
        n,
        "" if n == 1 else "s",
    )

    if not dp_logs_dir.exists():
        logger.info(
            "DAG processor logs directory %s does not exist, nothing to rotate",
            dp_logs_dir,
        )
        return

    date_dirs = [
        d for d in dp_logs_dir.iterdir()
        if d.is_dir() and _is_date_dir_name(d.name)
    ]
    if len(date_dirs) <= n:
        return

    logger.debug(
        "DAG processor has %d day dirs (keeping %d)",
        len(date_dirs),
        n,
    )

    date_dirs.sort(key=lambda d: d.name, reverse=True)

    for to_delete in date_dirs[n:]:
        logger.info("Removing old DAG processor logs: %s", to_delete)
        shutil.rmtree(to_delete)


def _is_date_dir_name(name: str) -> bool:
    """Return True if *name* looks like YYYY-MM-DD."""
    if len(name) != 10:
        return False
    if name[4] != "-" or name[7] != "-":
        return False
    return name[:4].isdigit() and name[5:7].isdigit() and name[8:10].isdigit()


if __name__ == "__main__":
    rotate_dag_processor_logs_task.function()
