"""Test cases for PATCH /api/users/{user_id}."""

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

# ── validation ────────────────────────────────────────────────────────────


async def test_update_user_validation(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    user_id, cookies = viewer_session
    test_client.cookies = cookies
    invalid_cases = [
        ({}, 422),
        ({"username": ""}, 422),
        ({"password": ""}, 422),
        ({"role": "superadmin"}, 422),
    ]
    for payload, expected_status in invalid_cases:
        response = await test_client.patch(
            f"/api/users/{user_id}",
            json=payload,
        )
        assert response.status_code == expected_status


# ── auth failures ─────────────────────────────────────────────────────────


async def test_update_user_no_token(test_client: AsyncClient) -> None:
    test_client.cookies.clear()
    response = await test_client.patch(
        "/api/users/1",
        json={"username": "renamed"},
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

    test_client.cookies = cookies
    response = await test_client.patch(
        f"/api/users/{other.id}",
        json={"username": "hacked"},
    )

    assert response.status_code == 403


# ── not found / duplicate ─────────────────────────────────────────────────


async def test_update_user_not_found(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    response = await test_client.patch(
        "/api/users/99999",
        json={"username": "ghost"},
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

    test_client.cookies = admin_session
    response = await test_client.patch(
        f"/api/users/{target.id}",
        json={"username": "taken"},
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

    test_client.cookies = admin_session
    response = await test_client.patch(
        f"/api/users/{target.id}",
        json={"username": "renamed", "role": "viewer"},
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

    test_client.cookies = cookies
    response = await test_client.patch(
        f"/api/users/{user_id}",
        json={"password": "newpass"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == user_id
    assert body["username"] == "viewer"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
