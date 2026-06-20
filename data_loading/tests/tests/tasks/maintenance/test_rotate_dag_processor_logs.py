"""Test cases for DAG processor log rotation."""
import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.maintenance.rotate_dag_processor_logs import (
    rotate_dag_processor_logs_task,
)
from python_common.src import Config


def _make_config(temp_dir: Path, dp_days_kept: int) -> Config:
    return Config.model_construct(
        assets_directory=temp_dir,
        airflow_logging_number_of_dag_processor_days_kept=dp_days_kept,
    )


def _make_date_dir(dp_logs_dir: Path, date_str: str) -> Path:
    """Create a YYYY-MM-DD directory inside *dp_logs_dir*."""
    d = dp_logs_dir / date_str
    d.mkdir(parents=True)
    return d


def test_no_dag_processor_directory(temp_directory: Path) -> None:
    """No dag_processor/ directory — should be a no-op."""
    logs_dir = temp_directory / "airflow" / "logs"
    logs_dir.mkdir(parents=True)
    config = _make_config(temp_directory, dp_days_kept=3)
    rotate_dag_processor_logs_task.function(config)


def test_fewer_days_than_n(temp_directory: Path) -> None:
    """Fewer date dirs than N — none should be deleted."""
    dp_logs_dir = temp_directory / "airflow" / "logs" / "dag_processor"
    _make_date_dir(dp_logs_dir, "2026-06-19")
    _make_date_dir(dp_logs_dir, "2026-06-20")

    config = _make_config(temp_directory, dp_days_kept=5)
    rotate_dag_processor_logs_task.function(config)

    remaining = sorted(d.name for d in dp_logs_dir.iterdir() if d.is_dir())
    assert remaining == ["2026-06-19", "2026-06-20"]


def test_more_days_than_n(temp_directory: Path) -> None:
    """More date dirs than N — oldest should be deleted."""
    dp_logs_dir = temp_directory / "airflow" / "logs" / "dag_processor"
    _make_date_dir(dp_logs_dir, "2026-06-16")
    _make_date_dir(dp_logs_dir, "2026-06-17")
    _make_date_dir(dp_logs_dir, "2026-06-18")
    _make_date_dir(dp_logs_dir, "2026-06-19")
    _make_date_dir(dp_logs_dir, "2026-06-20")

    config = _make_config(temp_directory, dp_days_kept=3)
    rotate_dag_processor_logs_task.function(config)

    remaining = sorted(d.name for d in dp_logs_dir.iterdir() if d.is_dir())
    assert remaining == ["2026-06-18", "2026-06-19", "2026-06-20"]


def test_exactly_n_days(temp_directory: Path) -> None:
    """Exactly N date dirs — none should be deleted."""
    dp_logs_dir = temp_directory / "airflow" / "logs" / "dag_processor"
    _make_date_dir(dp_logs_dir, "2026-06-18")
    _make_date_dir(dp_logs_dir, "2026-06-19")
    _make_date_dir(dp_logs_dir, "2026-06-20")

    config = _make_config(temp_directory, dp_days_kept=3)
    rotate_dag_processor_logs_task.function(config)

    remaining = sorted(d.name for d in dp_logs_dir.iterdir() if d.is_dir())
    assert len(remaining) == 3


def test_non_date_directories_skipped(temp_directory: Path) -> None:
    """Directories not matching YYYY-MM-DD pattern are skipped."""
    dp_logs_dir = temp_directory / "airflow" / "logs" / "dag_processor"
    _make_date_dir(dp_logs_dir, "2026-06-19")
    _make_date_dir(dp_logs_dir, "2026-06-20")
    (dp_logs_dir / "not-a-date").mkdir()
    (dp_logs_dir / "dags-folder").mkdir()

    config = _make_config(temp_directory, dp_days_kept=2)
    rotate_dag_processor_logs_task.function(config)

    remaining = sorted(d.name for d in dp_logs_dir.iterdir() if d.is_dir())
    assert len(remaining) == 4  # 2 date dirs + 2 non-matching


def test_cross_month_boundary(temp_directory: Path) -> None:
    """Dates crossing month boundaries are sorted correctly."""
    dp_logs_dir = temp_directory / "airflow" / "logs" / "dag_processor"
    _make_date_dir(dp_logs_dir, "2026-05-30")
    _make_date_dir(dp_logs_dir, "2026-05-31")
    _make_date_dir(dp_logs_dir, "2026-06-01")
    _make_date_dir(dp_logs_dir, "2026-06-02")

    config = _make_config(temp_directory, dp_days_kept=2)
    rotate_dag_processor_logs_task.function(config)

    remaining = sorted(d.name for d in dp_logs_dir.iterdir() if d.is_dir())
    assert remaining == ["2026-06-01", "2026-06-02"]


def test_cross_year_boundary(temp_directory: Path) -> None:
    """Dates crossing year boundaries are sorted correctly."""
    dp_logs_dir = temp_directory / "airflow" / "logs" / "dag_processor"
    _make_date_dir(dp_logs_dir, "2025-12-30")
    _make_date_dir(dp_logs_dir, "2025-12-31")
    _make_date_dir(dp_logs_dir, "2026-01-01")
    _make_date_dir(dp_logs_dir, "2026-01-02")

    config = _make_config(temp_directory, dp_days_kept=2)
    rotate_dag_processor_logs_task.function(config)

    remaining = sorted(d.name for d in dp_logs_dir.iterdir() if d.is_dir())
    assert remaining == ["2026-01-01", "2026-01-02"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
