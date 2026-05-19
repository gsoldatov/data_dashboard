"""Test cases for POST /api/users."""

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


async def test_create_user_validation(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    invalid_cases = [
        ({"password": "pass123", "role": "viewer"}, 422),
        ({"username": "new_user", "role": "viewer"}, 422),
        ({"username": "", "password": "pass123", "role": "viewer"}, 422),
        ({"username": "new_user", "password": "", "role": "viewer"}, 422),
        ({"username": "new_user", "password": "pass123", "role": "superadmin"}, 422),
    ]
    for payload, expected_status in invalid_cases:
        response = await test_client.post(
            "/api/users",
            json=payload,
        )
        assert response.status_code == expected_status


# ── auth failures ─────────────────────────────────────────────────────────


async def test_create_user_no_token(test_client: AsyncClient) -> None:
    test_client.cookies.clear()
    response = await test_client.post(
        "/api/users",
        json={"username": "new_user", "password": "pass123", "role": "viewer"},
    )
    assert response.status_code == 401


async def test_create_user_viewer_token(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    _user_id, cookies = viewer_session
    test_client.cookies = cookies

    response = await test_client.post(
        "/api/users",
        json={"username": "new_user", "password": "pass123", "role": "viewer"},
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

    test_client.cookies = admin_session
    response = await test_client.post(
        "/api/users",
        json={"username": "existing", "password": "pass123", "role": "viewer"},
    )

    assert response.status_code == 409


# ── success ───────────────────────────────────────────────────────────────


async def test_create_user_success(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    response = await test_client.post(
        "/api/users",
        json={"username": "new_user", "password": "pass123", "role": "viewer"},
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
