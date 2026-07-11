"""Test cases for PATCH /api/airflow/dags/{dag_id}."""

import sys
from pathlib import Path

import pytest
from httpx import AsyncClient

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from dashboard_backend.tests.mocks.airflow_service import MockAirflowService
from dashboard_backend.tests.mocks.airflow_service.overrides import (
    network_error,
    not_found_error,
)

# ── auth failures ─────────────────────────────────────────────────────────


async def test_update_dag_no_token(test_client: AsyncClient) -> None:
    test_client.cookies.clear()
    response = await test_client.patch(
        "/api/airflow/dags/test_dag", json={"is_paused": True}
    )
    assert response.status_code == 401


async def test_update_dag_viewer(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    _user_id, cookies = viewer_session
    test_client.cookies = cookies
    response = await test_client.patch(
        "/api/airflow/dags/test_dag", json={"is_paused": True}
    )
    assert response.status_code == 403


# ── validation errors ─────────────────────────────────────────────────────


async def test_update_dag_empty_body(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    response = await test_client.patch(
        "/api/airflow/dags/test_dag", json={}
    )
    assert response.status_code == 422


async def test_update_dag_is_paused_not_bool(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    response = await test_client.patch(
        "/api/airflow/dags/test_dag", json={"is_paused": "not_a_bool"}
    )
    assert response.status_code == 422


# ── error cases ────────────────────────────────────────────────────────────


async def test_update_dag_airflow_unavailable(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    mock_airflow_service: MockAirflowService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(mock_airflow_service, "update_dag", network_error)
    test_client.cookies = admin_session
    response = await test_client.patch(
        "/api/airflow/dags/test_dag", json={"is_paused": True}
    )
    assert response.status_code == 503


async def test_update_dag_not_found(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    mock_airflow_service: MockAirflowService,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setattr(mock_airflow_service, "update_dag", not_found_error)
    test_client.cookies = admin_session
    response = await test_client.patch(
        "/api/airflow/dags/nonexistent", json={"is_paused": True}
    )
    assert response.status_code == 404


# ── success ────────────────────────────────────────────────────────────────


async def test_update_dag_pause(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    response = await test_client.patch(
        "/api/airflow/dags/test_dag", json={"is_paused": True}
    )
    assert response.status_code == 204
    assert response.content == b""


async def test_update_dag_unpause(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    response = await test_client.patch(
        "/api/airflow/dags/test_dag", json={"is_paused": False}
    )
    assert response.status_code == 204
    assert response.content == b""


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
