"""Test cases for POST /api/auth/login."""

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
from python_common.src.config import Config

# ── validation ────────────────────────────────────────────────────────────


async def test_login_missing_username(test_client: AsyncClient) -> None:
    response = await test_client.post(
        "/api/auth/login",
        json={"password": "pass"},
    )
    assert response.status_code == 422


async def test_login_missing_password(test_client: AsyncClient) -> None:
    response = await test_client.post(
        "/api/auth/login",
        json={"username": "user"},
    )
    assert response.status_code == 422


async def test_login_empty_username(test_client: AsyncClient) -> None:
    response = await test_client.post(
        "/api/auth/login",
        json={"username": "", "password": "pass"},
    )
    assert response.status_code == 422


async def test_login_empty_password(test_client: AsyncClient) -> None:
    response = await test_client.post(
        "/api/auth/login",
        json={"username": "user", "password": ""},
    )
    assert response.status_code == 422


# ── already authenticated ─────────────────────────────────────────────────


async def test_login_already_authenticated(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    response = await test_client.post(
        "/api/auth/login",
        json={"username": "anyone", "password": "any"},
        cookies=admin_session,
    )
    assert response.status_code == 403


# ── invalid credentials ───────────────────────────────────────────────────


async def test_login_invalid_credentials(
    test_client: AsyncClient,
    test_config: Config,
) -> None:
    response = await test_client.post(
        "/api/auth/login",
        json={
            "username": test_config.backend_default_user_name,
            "password": "wrong_password",
        },
    )
    assert response.status_code == 401


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
    assert "user_id" in body
    assert "expires_at" in body
    assert "token" not in body
    # Verify session_token cookie was set
    assert "session_token" in response.cookies


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
