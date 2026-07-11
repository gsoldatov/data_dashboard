"""Test cases for GET /api/airflow/dags."""

import sys
from pathlib import Path

import pytest
from httpx import AsyncClient

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from dashboard_backend.src.models.airflow import DagStatus
from dashboard_backend.tests.mocks.airflow_service import MockAirflowService
from dashboard_backend.tests.mocks.airflow_service.overrides import network_error

# ── auth failures ─────────────────────────────────────────────────────────


async def test_list_dags_no_token(test_client: AsyncClient) -> None:
    test_client.cookies.clear()
    response = await test_client.get("/api/airflow/dags")
    assert response.status_code == 401


async def test_list_dags_viewer(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    _user_id, cookies = viewer_session
    test_client.cookies = cookies
    response = await test_client.get("/api/airflow/dags")
    assert response.status_code == 403


# ── error cases ────────────────────────────────────────────────────────────


async def test_list_dags_airflow_unavailable(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    mock_airflow_service: MockAirflowService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(mock_airflow_service, "get_dags", network_error)
    test_client.cookies = admin_session
    response = await test_client.get("/api/airflow/dags")
    assert response.status_code == 503


# ── success ────────────────────────────────────────────────────────────────


async def test_list_dags_empty(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    response = await test_client.get("/api/airflow/dags")
    assert response.status_code == 200
    body = response.json()
    assert body == {"dags": [], "total": 0, "limit": 20, "offset": 0}


async def test_list_dags_populated(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    mock_airflow_service: MockAirflowService,
) -> None:
    mock_airflow_service.set_dags(
        dags=[
            DagStatus(
                dag_id="test_dag",
                description="A test DAG",
                is_paused=False,
                timetable_summary="Every 5 minutes",
                next_dagrun="2026-07-10T12:00:00",
                last_run_state="success",
                last_run_start_date="2026-07-10T11:55:00",
            )
        ],
        total=1,
    )
    test_client.cookies = admin_session
    response = await test_client.get("/api/airflow/dags")
    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert len(body["dags"]) == 1
    assert body["dags"][0]["dag_id"] == "test_dag"
    assert body["dags"][0]["last_run_state"] == "success"


async def test_list_dags_custom_limit_offset(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    response = await test_client.get(
        "/api/airflow/dags", params={"limit": 10, "offset": 5}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["limit"] == 10
    assert body["offset"] == 5


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
