"""Test cases for PATCH /api/users/{user_id}."""

import sys
from pathlib import Path

import pytest
from httpx import AsyncClient

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from dashboard_backend.src.util.passwords import verify_password
from dashboard_backend.tests.mocks.data_generator import DataGenerator
from dashboard_backend.tests.mocks.db_operations import DBOperations

# ── validation ────────────────────────────────────────────────────────────


async def test_update_user_validation(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
    db_operations: DBOperations,
) -> None:
    user_id, cookies = viewer_session
    test_client.cookies = cookies
    invalid_cases = [
        ({}, 422),
        ({"current_user_password": ""}, 422),
        ({"current_user_password": "pass", "username": ""}, 422),
        ({"current_user_password": "pass", "password": ""}, 422),
        ({"current_user_password": "pass", "role": "superadmin"}, 422),
    ]
    for payload, expected_status in invalid_cases:
        response = await test_client.patch(
            f"/api/users/{user_id}",
            json=payload,
        )
        assert response.status_code == expected_status

    viewer = await db_operations.users.by_id(user_id)
    assert viewer is not None
    assert viewer.username == "viewer"


# ── auth failures ─────────────────────────────────────────────────────────


async def test_update_user_no_token(
    test_client: AsyncClient,
    db_operations: DBOperations,
) -> None:
    test_client.cookies.clear()
    response = await test_client.patch(
        "/api/users/1",
        json={"current_user_password": "x", "username": "renamed"},
    )
    assert response.status_code == 401

    admin = await db_operations.users.by_id(1)
    assert admin is not None
    assert admin.username == "admin"


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
        json={"current_user_password": "pass", "username": "hacked"},
    )

    assert response.status_code == 403

    other_db = await db_operations.users.by_id(other.id)
    assert other_db is not None
    assert other_db.username == "other"


# ── not found / duplicate ─────────────────────────────────────────────────


async def test_update_user_not_found(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    db_operations: DBOperations,
) -> None:
    test_client.cookies = admin_session
    response = await test_client.patch(
        "/api/users/99999",
        json={"current_user_password": "admin", "username": "ghost"},
    )

    assert response.status_code == 404

    admin = await db_operations.users.by_id(1)
    assert admin is not None
    assert admin.username == "admin"


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
        json={"current_user_password": "admin", "username": "taken"},
    )

    assert response.status_code == 409

    target_db = await db_operations.users.by_id(target.id)
    assert target_db is not None
    assert target_db.username == "target"


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
        json={
            "current_user_password": "admin",
            "username": "renamed",
            "role": "viewer"
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == target.id
    assert body["username"] == "renamed"
    assert body["role"] == "viewer"

    result = await db_operations.users.by_username_with_hash("renamed")
    assert result is not None
    _user, password_hash = result
    assert verify_password("pass", password_hash)
    assert _user.role == "viewer"


async def test_update_user_self_success(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
    db_operations: DBOperations,
) -> None:
    user_id, cookies = viewer_session

    test_client.cookies = cookies
    response = await test_client.patch(
        f"/api/users/{user_id}",
        json={"current_user_password": "pass", "password": "newpass"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == user_id
    assert body["username"] == "viewer"

    result = await db_operations.users.by_username_with_hash("viewer")
    assert result is not None
    _user, password_hash = result
    assert verify_password("newpass", password_hash)


# ── wrong current password ────────────────────────────────────────────────


async def test_update_user_wrong_current_password(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
    db_operations: DBOperations,
) -> None:
    user_id, cookies = viewer_session

    test_client.cookies = cookies
    response = await test_client.patch(
        f"/api/users/{user_id}",
        json={"current_user_password": "wrong", "username": "new_name"},
    )

    assert response.status_code == 400
    assert "Incorrect current password" in response.json()["detail"]

    viewer = await db_operations.users.by_id(user_id)
    assert viewer is not None
    assert viewer.username == "viewer"


# ── admin updating other user ──────────────────────────────────────────────


async def test_update_user_admin_updating_other_with_own_password(
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
        json={"current_user_password": "admin", "username": "renamed_by_admin"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == target.id
    assert body["username"] == "renamed_by_admin"

    result = await db_operations.users.by_username_with_hash("renamed_by_admin")
    assert result is not None
    _user, password_hash = result
    assert verify_password("pass", password_hash)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
