"""Mock Airflow service for tests — returns canned data (happy path only).

Error scenarios are handled by monkeypatching with functions from
``overrides.py``.
"""

from __future__ import annotations

from dashboard_backend.src.models.airflow import DagStatus, DagUpdate
from dashboard_backend.src.services.airflow import AirflowServiceProtocol


class MockAirflowService(AirflowServiceProtocol):
    """Configurable mock returning pre-set DAG lists."""

    def __init__(self) -> None:
        self._dags: list[DagStatus] = []
        self._total: int = 0

    def set_dags(self, dags: list[DagStatus], total: int) -> None:
        """Configure canned DAG list and total entries."""
        self._dags = dags
        self._total = total

    async def get_dags(
        self, limit: int, offset: int
    ) -> tuple[list[DagStatus], int]:
        return self._dags, self._total

    async def update_dag(self, dag_id: str, update: DagUpdate) -> None:
        pass

    async def close(self) -> None:
        pass
