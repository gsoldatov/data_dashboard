"""Test cases for POST /api/auth/login."""

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
from python_common.src.config import Config

# ── validation ────────────────────────────────────────────────────────────


async def test_login_validation(
    test_client: AsyncClient,
    test_config: Config,
    db_operations: DBOperations,
) -> None:
    invalid_cases = [
        ({"password": "pass"}, 422),
        ({"username": "user"}, 422),
        ({"username": "", "password": "pass"}, 422),
        ({"username": "user", "password": ""}, 422),
    ]
    for payload, expected_status in invalid_cases:
        response = await test_client.post(
            "/api/auth/login",
            json=payload,
        )
        assert response.status_code == expected_status

    admin = await db_operations.users.by_username(
        test_config.backend_default_user_name
    )
    assert admin is not None
    sessions = await db_operations.sessions.get_user_sessions(admin.id)
    assert len(sessions) == 0


# ── already authenticated ─────────────────────────────────────────────────


async def test_login_already_authenticated(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    test_config: Config,
    db_operations: DBOperations,
) -> None:
    test_client.cookies = admin_session
    response = await test_client.post(
        "/api/auth/login",
        json={"username": "anyone", "password": "any"},
    )
    assert response.status_code == 403

    admin = await db_operations.users.by_username(
        test_config.backend_default_user_name
    )
    assert admin is not None
    sessions = await db_operations.sessions.get_user_sessions(admin.id)
    assert len(sessions) == 1
    assert sessions[0].token == admin_session["session_token"]


# ── invalid credentials ───────────────────────────────────────────────────


async def test_login_invalid_credentials(
    test_client: AsyncClient,
    test_config: Config,
    db_operations: DBOperations,
) -> None:
    response = await test_client.post(
        "/api/auth/login",
        json={
            "username": test_config.backend_default_user_name,
            "password": "wrong_password",
        },
    )
    assert response.status_code == 401

    admin = await db_operations.users.by_username(
        test_config.backend_default_user_name
    )
    assert admin is not None
    sessions = await db_operations.sessions.get_user_sessions(admin.id)
    assert len(sessions) == 0


# ── success ───────────────────────────────────────────────────────────────


async def test_login_success(
    test_client: AsyncClient,
    test_config: Config,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    await db_operations.users.insert(
        data_generator.users.user_create(
            username="login_user", password="correct", role="viewer"
        )
    )

    response = await test_client.post(
        "/api/auth/login",
        json={"username": "login_user", "password": "correct"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["username"] == "login_user"
    assert body["role"] == "viewer"
    assert "id" in body
    assert "created_at" in body
    # Verify session_token cookie was set
    assert "session_token" in response.cookies

    token = response.cookies["session_token"]
    sessions = await db_operations.sessions.get_user_sessions(body["id"])
    assert len(sessions) == 1
    assert sessions[0].token == token


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
