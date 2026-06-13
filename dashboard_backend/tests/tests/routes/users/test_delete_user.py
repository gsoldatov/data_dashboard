"""Test cases for DELETE /api/users/{user_id}."""

import sys
from pathlib import Path

import pytest
from httpx import AsyncClient

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from dashboard_backend.tests.mocks.data_generator import DataGenerator
from dashboard_backend.tests.mocks.db_operations import DBOperations

# ── auth failures ─────────────────────────────────────────────────────────


async def test_delete_user_no_token(
    test_client: AsyncClient,
    db_operations: DBOperations,
) -> None:
    test_client.cookies.clear()
    response = await test_client.delete(
        "/api/users/1",
    )
    assert response.status_code == 401

    admin = await db_operations.users.by_id(1)
    assert admin is not None
    assert admin.username == "admin"


async def test_delete_user_viewer_token(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
    db_operations: DBOperations,
) -> None:
    _viewer_id, cookies = viewer_session
    test_client.cookies = cookies

    response = await test_client.delete(
        "/api/users/1",
    )

    assert response.status_code == 403

    admin = await db_operations.users.by_id(1)
    assert admin is not None
    assert admin.username == "admin"


# ── not found ─────────────────────────────────────────────────────────────


async def test_delete_user_not_found(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    db_operations: DBOperations,
) -> None:
    test_client.cookies = admin_session
    response = await test_client.delete(
        "/api/users/99999",
    )

    assert response.status_code == 404

    admin = await db_operations.users.by_id(1)
    assert admin is not None
    assert admin.username == "admin"


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

    test_client.cookies = admin_session
    response = await test_client.delete(
        f"/api/users/{target.id}",
    )

    assert response.status_code == 204
    deleted = await db_operations.users.by_id(target.id)
    assert deleted is None
    # Admin user should not be affected
    admin = await db_operations.users.by_id(1)
    assert admin is not None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
