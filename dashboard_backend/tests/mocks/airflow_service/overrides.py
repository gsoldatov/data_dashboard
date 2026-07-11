"""Monkeypatch overrides for MockAirflowService error scenarios."""

from dashboard_backend.src.util.exceptions import (
    AirflowUnavailableException,
    NotFoundException,
)


async def network_error(self, *args, **kwargs) -> None:  # type: ignore[no-untyped-def]
    raise AirflowUnavailableException(
        "Airflow API server is unreachable"
    )


async def not_found_error(self, *args, **kwargs) -> None:  # type: ignore[no-untyped-def]
    raise NotFoundException("Airflow resource not found")
