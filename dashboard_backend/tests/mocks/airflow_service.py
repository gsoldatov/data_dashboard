"""Mock Airflow service for tests — returns canned data or raises exceptions."""

from __future__ import annotations

from dashboard_backend.src.models.airflow import DagStatus
from dashboard_backend.src.services.airflow import AirflowServiceProtocol
from dashboard_backend.src.util.exceptions import (
    AirflowUnavailableException,
    ApplicationException,
)


class MockAirflowService(AirflowServiceProtocol):
    """Configurable mock returning pre-set DAG lists or errors."""

    def __init__(self) -> None:
        self._dags: list[DagStatus] = []
        self._total: int = 0
        self._error: Exception | None = None

    def set_dags(self, dags: list[DagStatus], total: int) -> None:
        """Configure canned DAG list and total entries."""
        self._dags = dags
        self._total = total
        self._error = None

    def set_error(self, error: Exception) -> None:
        """Make the next ``get_dags`` call raise *error*."""
        self._error = error

    async def get_dags(
        self, limit: int, offset: int
    ) -> tuple[list[DagStatus], int]:
        if self._error is not None:
            raise self._error
        return self._dags, self._total

    async def close(self) -> None:
        pass
