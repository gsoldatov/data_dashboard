"""Test cases for POST /api/users."""

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


async def test_create_user_missing_username(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    response = await test_client.post(
        "/api/users",
        json={"password": "pass123", "role": "viewer"},
        cookies=admin_session,
    )
    assert response.status_code == 422


async def test_create_user_missing_password(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    response = await test_client.post(
        "/api/users",
        json={"username": "new_user", "role": "viewer"},
        cookies=admin_session,
    )
    assert response.status_code == 422


async def test_create_user_empty_username(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    response = await test_client.post(
        "/api/users",
        json={"username": "", "password": "pass123", "role": "viewer"},
        cookies=admin_session,
    )
    assert response.status_code == 422


async def test_create_user_empty_password(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    response = await test_client.post(
        "/api/users",
        json={"username": "new_user", "password": "", "role": "viewer"},
        cookies=admin_session,
    )
    assert response.status_code == 422


async def test_create_user_invalid_role(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    response = await test_client.post(
        "/api/users",
        json={"username": "new_user", "password": "pass123", "role": "superadmin"},
        cookies=admin_session,
    )
    assert response.status_code == 422


# ── auth failures ─────────────────────────────────────────────────────────


async def test_create_user_no_token(test_client: AsyncClient) -> None:
    response = await test_client.post(
        "/api/users",
        json={"username": "new_user", "password": "pass123", "role": "viewer"},
        cookies={},
    )
    assert response.status_code == 401


async def test_create_user_viewer_token(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    _user_id, cookies = viewer_session

    response = await test_client.post(
        "/api/users",
        json={"username": "new_user", "password": "pass123", "role": "viewer"},
        cookies=cookies,
    )

    assert response.status_code == 403


# ── duplicate ─────────────────────────────────────────────────────────────


async def test_create_user_duplicate_username(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    await db_operations.users.insert(
        data_generator.users.user_create(
            username="existing", password="pass", role="viewer"
        )
    )

    response = await test_client.post(
        "/api/users",
        json={"username": "existing", "password": "pass123", "role": "viewer"},
        cookies=admin_session,
    )

    assert response.status_code == 409


# ── success ───────────────────────────────────────────────────────────────


async def test_create_user_success(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    response = await test_client.post(
        "/api/users",
        json={"username": "new_user", "password": "pass123", "role": "viewer"},
        cookies=admin_session,
    )

    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "new_user"
    assert body["role"] == "viewer"
    assert "id" in body
    assert "created_at" in body
    assert "password" not in body
    assert "password_hash" not in body


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
