"""Test cases for DAG run log rotation."""
import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.maintenance.rotate_dag_run_logs import (
    rotate_dag_run_logs_task,
)
from python_common.src import Config


def _make_config(temp_dir: Path, dag_runs_kept: int) -> Config:
    return Config.model_construct(
        assets_directory=temp_dir,
        airflow_logging_number_of_dag_runs_kept=dag_runs_kept,
    )


def _make_run_dir(
    dag_dir: Path, run_type: str, timestamp: str
) -> Path:
    """Create a run_id= directory inside *dag_dir*."""
    run_dir = dag_dir / f"run_id={run_type}__{timestamp}"
    run_dir.mkdir(parents=True)
    return run_dir


def test_no_logs_directory(temp_directory: Path) -> None:
    """No logs/ directory exists — should be a no-op."""
    config = _make_config(temp_directory, dag_runs_kept=3)
    rotate_dag_run_logs_task.function(config)


def test_no_dag_directories(temp_directory: Path) -> None:
    """Empty logs/ directory — should be a no-op."""
    logs_dir = temp_directory / "airflow" / "logs"
    logs_dir.mkdir(parents=True)
    config = _make_config(temp_directory, dag_runs_kept=3)
    rotate_dag_run_logs_task.function(config)


def test_fewer_runs_than_n(temp_directory: Path) -> None:
    """Fewer run dirs than N — none should be deleted."""
    logs_dir = temp_directory / "airflow" / "logs"
    dag_dir = logs_dir / "dag_id=test_dag"
    _make_run_dir(dag_dir, "scheduled", "2026-06-18T00:00:00+00:00")
    _make_run_dir(dag_dir, "scheduled", "2026-06-19T00:00:00+00:00")

    config = _make_config(temp_directory, dag_runs_kept=5)
    rotate_dag_run_logs_task.function(config)

    remaining = sorted(d.name for d in dag_dir.iterdir() if d.is_dir())
    assert len(remaining) == 2


def test_more_runs_than_n(temp_directory: Path) -> None:
    """More run dirs than N — oldest should be deleted."""
    logs_dir = temp_directory / "airflow" / "logs"
    dag_dir = logs_dir / "dag_id=test_dag"
    _make_run_dir(dag_dir, "scheduled", "2026-06-16T00:00:00+00:00")
    _make_run_dir(dag_dir, "scheduled", "2026-06-17T00:00:00+00:00")
    _make_run_dir(dag_dir, "scheduled", "2026-06-18T00:00:00+00:00")
    _make_run_dir(dag_dir, "scheduled", "2026-06-19T00:00:00+00:00")
    _make_run_dir(dag_dir, "scheduled", "2026-06-20T00:00:00+00:00")

    config = _make_config(temp_directory, dag_runs_kept=3)
    rotate_dag_run_logs_task.function(config)

    remaining = sorted(d.name for d in dag_dir.iterdir() if d.is_dir())
    assert remaining == [
        "run_id=scheduled__2026-06-18T00:00:00+00:00",
        "run_id=scheduled__2026-06-19T00:00:00+00:00",
        "run_id=scheduled__2026-06-20T00:00:00+00:00",
    ]


def test_exactly_n_runs(temp_directory: Path) -> None:
    """Exactly N run dirs — none should be deleted."""
    logs_dir = temp_directory / "airflow" / "logs"
    dag_dir = logs_dir / "dag_id=test_dag"
    _make_run_dir(dag_dir, "scheduled", "2026-06-18T00:00:00+00:00")
    _make_run_dir(dag_dir, "scheduled", "2026-06-19T00:00:00+00:00")
    _make_run_dir(dag_dir, "scheduled", "2026-06-20T00:00:00+00:00")

    config = _make_config(temp_directory, dag_runs_kept=3)
    rotate_dag_run_logs_task.function(config)

    remaining = sorted(d.name for d in dag_dir.iterdir() if d.is_dir())
    assert len(remaining) == 3


def test_malformed_run_dir_names_skipped(temp_directory: Path) -> None:
    """Run dirs without parseable timestamps are skipped, not crashed on."""
    logs_dir = temp_directory / "airflow" / "logs"
    dag_dir = logs_dir / "dag_id=test_dag"
    _make_run_dir(dag_dir, "scheduled", "2026-06-19T00:00:00+00:00")
    _make_run_dir(dag_dir, "scheduled", "2026-06-20T00:00:00+00:00")
    # These have no parseable timestamp
    _make_run_dir(dag_dir, "manual", "not-a-timestamp")
    _make_run_dir(dag_dir, "manual", "")

    config = _make_config(temp_directory, dag_runs_kept=2)
    rotate_dag_run_logs_task.function(config)

    # Valid ones kept; malformed ones also kept (not deleted, treated as not matching)
    remaining = sorted(d.name for d in dag_dir.iterdir() if d.is_dir())
    assert len(remaining) == 4


def test_non_matching_directories_skipped(temp_directory: Path) -> None:
    """Directories not matching dag_id=* or run_id=* patterns are skipped."""
    logs_dir = temp_directory / "airflow" / "logs"
    dag_dir = logs_dir / "dag_id=test_dag"
    _make_run_dir(dag_dir, "scheduled", "2026-06-19T00:00:00+00:00")
    _make_run_dir(dag_dir, "scheduled", "2026-06-20T00:00:00+00:00")
    # Non-matching dir inside dag_id
    (dag_dir / "something_else").mkdir()

    # Non-matching top-level dir
    (logs_dir / "dag_processor").mkdir()

    config = _make_config(temp_directory, dag_runs_kept=2)
    rotate_dag_run_logs_task.function(config)

    remaining = sorted(d.name for d in dag_dir.iterdir() if d.is_dir())
    assert len(remaining) == 3  # 2 run dirs + something_else


def test_multiple_dags(temp_directory: Path) -> None:
    """Rotation works independently for each DAG."""
    logs_dir = temp_directory / "airflow" / "logs"
    dag_a = logs_dir / "dag_id=dag_a"
    dag_b = logs_dir / "dag_id=dag_b"
    _make_run_dir(dag_a, "scheduled", "2026-06-17T00:00:00+00:00")
    _make_run_dir(dag_a, "scheduled", "2026-06-18T00:00:00+00:00")
    _make_run_dir(dag_a, "scheduled", "2026-06-19T00:00:00+00:00")
    _make_run_dir(dag_a, "scheduled", "2026-06-20T00:00:00+00:00")
    _make_run_dir(dag_b, "scheduled", "2026-06-19T00:00:00+00:00")
    _make_run_dir(dag_b, "scheduled", "2026-06-20T00:00:00+00:00")

    config = _make_config(temp_directory, dag_runs_kept=2)
    rotate_dag_run_logs_task.function(config)

    a_remaining = sorted(d.name for d in dag_a.iterdir() if d.is_dir())
    b_remaining = sorted(d.name for d in dag_b.iterdir() if d.is_dir())
    assert a_remaining == [
        "run_id=scheduled__2026-06-19T00:00:00+00:00",
        "run_id=scheduled__2026-06-20T00:00:00+00:00",
    ]
    assert b_remaining == [
        "run_id=scheduled__2026-06-19T00:00:00+00:00",
        "run_id=scheduled__2026-06-20T00:00:00+00:00",
    ]


def test_manual_and_scheduled_runs_mixed(temp_directory: Path) -> None:
    """Manual and scheduled runs are sorted together by timestamp."""
    logs_dir = temp_directory / "airflow" / "logs"
    dag_dir = logs_dir / "dag_id=test_dag"
    _make_run_dir(dag_dir, "scheduled", "2026-06-18T00:00:00+00:00")
    _make_run_dir(dag_dir, "manual", "2026-06-18T12:00:00+00:00")
    _make_run_dir(dag_dir, "scheduled", "2026-06-19T00:00:00+00:00")
    _make_run_dir(dag_dir, "manual", "2026-06-20T14:50:23.898267+00:00")
    _make_run_dir(dag_dir, "scheduled", "2026-06-20T00:00:00+00:00")

    config = _make_config(temp_directory, dag_runs_kept=3)
    rotate_dag_run_logs_task.function(config)

    remaining = sorted(d.name for d in dag_dir.iterdir() if d.is_dir())
    # The 3 most recent by timestamp should be kept:
    # manual__2026-06-20T14:50:23..., scheduled__2026-06-20, scheduled__2026-06-19
    assert remaining == [
        "run_id=manual__2026-06-20T14:50:23.898267+00:00",
        "run_id=scheduled__2026-06-19T00:00:00+00:00",
        "run_id=scheduled__2026-06-20T00:00:00+00:00",
    ]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
