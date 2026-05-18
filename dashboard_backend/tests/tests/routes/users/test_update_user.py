"""Test cases for PATCH /api/users/{user_id}."""

import sys
from pathlib import Path

import pytest
from httpx import AsyncClient

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[6]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from dashboard_backend.tests.mocks.data_generator import DataGenerator  # noqa: E402
from dashboard_backend.tests.mocks.db_operations import DBOperations  # noqa: E402

# ── validation ────────────────────────────────────────────────────────────


async def test_update_user_all_fields_null(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    user_id, cookies = viewer_session
    response = await test_client.patch(
        f"/api/users/{user_id}",
        json={},
        cookies=cookies,
    )
    assert response.status_code == 422


async def test_update_user_empty_username(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    user_id, cookies = viewer_session
    response = await test_client.patch(
        f"/api/users/{user_id}",
        json={"username": ""},
        cookies=cookies,
    )
    assert response.status_code == 422


async def test_update_user_empty_password(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    user_id, cookies = viewer_session
    response = await test_client.patch(
        f"/api/users/{user_id}",
        json={"password": ""},
        cookies=cookies,
    )
    assert response.status_code == 422

async def test_update_user_invalid_role(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    user_id, cookies = viewer_session
    response = await test_client.patch(
        f"/api/users/{user_id}",
        json={"role": "superadmin"},
        cookies=cookies,
    )
    assert response.status_code == 422


# ── auth failures ─────────────────────────────────────────────────────────


async def test_update_user_no_token(test_client: AsyncClient) -> None:
    response = await test_client.patch(
        "/api/users/1",
        json={"username": "renamed"},
        cookies={},
    )
    assert response.status_code == 401


async def test_update_user_viewer_updating_other(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    _viewer_id, cookies = viewer_session
    other = await db_operations.users.insert(
        data_generator.users.user_create(
            username="other", password="pass", role="viewer"
        )
    )

    response = await test_client.patch(
        f"/api/users/{other.id}",
        json={"username": "hacked"},
        cookies=cookies,
    )

    assert response.status_code == 403


# ── not found / duplicate ─────────────────────────────────────────────────


async def test_update_user_not_found(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    response = await test_client.patch(
        "/api/users/99999",
        json={"username": "ghost"},
        cookies=admin_session,
    )

    assert response.status_code == 404


async def test_update_user_duplicate_username(
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
    await db_operations.users.insert(
        data_generator.users.user_create(
            username="taken", password="pass", role="viewer"
        )
    )

    response = await test_client.patch(
        f"/api/users/{target.id}",
        json={"username": "taken"},
        cookies=admin_session,
    )

    assert response.status_code == 409


# ── success ───────────────────────────────────────────────────────────────


async def test_update_user_admin_success(
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

    response = await test_client.patch(
        f"/api/users/{target.id}",
        json={"username": "renamed", "role": "viewer"},
        cookies=admin_session,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == target.id
    assert body["username"] == "renamed"
    assert body["role"] == "viewer"


async def test_update_user_self_success(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    user_id, cookies = viewer_session

    response = await test_client.patch(
        f"/api/users/{user_id}",
        json={"password": "newpass"},
        cookies=cookies,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == user_id
    assert body["username"] == "viewer"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
