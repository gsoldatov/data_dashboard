"""Test cases for DELETE /api/users/{user_id}."""

import sys
from pathlib import Path

import pytest
from httpx import AsyncClient

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[6]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from dashboard_backend.tests.mocks.data_generator import DataGenerator
from dashboard_backend.tests.mocks.db_operations import DBOperations

# ── auth failures ─────────────────────────────────────────────────────────


async def test_delete_user_no_token(test_client: AsyncClient) -> None:
    response = await test_client.delete(
        "/api/users/1",
        cookies={},
    )
    assert response.status_code == 401


async def test_delete_user_viewer_token(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    _viewer_id, cookies = viewer_session

    response = await test_client.delete(
        "/api/users/1",
        cookies=cookies,
    )

    assert response.status_code == 403


# ── not found ─────────────────────────────────────────────────────────────


async def test_delete_user_not_found(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    response = await test_client.delete(
        "/api/users/99999",
        cookies=admin_session,
    )

    assert response.status_code == 404


# ── success ───────────────────────────────────────────────────────────────


async def test_delete_user_success(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    target = await db_operations.users.insert(
        data_generator.users.user_create(
            username="target", password="pass", role="viewer"
        )
    )

    response = await test_client.delete(
        f"/api/users/{target.id}",
        cookies=admin_session,
    )

    assert response.status_code == 204
    deleted = await db_operations.users.by_id(target.id)
    assert deleted is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
