"""Test cases for GET /api/auth/me."""

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


async def test_me_no_session(test_client: AsyncClient) -> None:
    """Returns 404 without a body when no session cookie is present."""
    test_client.cookies.clear()
    response = await test_client.get("/api/auth/me")
    assert response.status_code == 404
    assert response.text == ""


async def test_me_invalid_token(test_client: AsyncClient) -> None:
    """Returns 404 without a body when the token is invalid."""
    test_client.cookies = {"session_token": "nonexistent_token"}
    response = await test_client.get("/api/auth/me")
    assert response.status_code == 404
    assert response.text == ""


async def test_me_success(
    test_client: AsyncClient,
    test_config: Config,
    admin_session: dict[str, str],
) -> None:
    """Returns the current user when a valid session cookie is present."""
    test_client.cookies = admin_session
    response = await test_client.get("/api/auth/me")
    assert response.status_code == 200
    body = response.json()
    assert body["username"] == test_config.backend_default_user_name
    assert body["role"] == "admin"
    assert "id" in body
    assert "created_at" in body
    assert "password" not in body
    assert "password_hash" not in body


async def test_me_expired_session(
    test_config: Config,
    test_client: AsyncClient,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """Returns 404 when the session has expired."""
    from datetime import UTC, datetime, timedelta

    user = await db_operations.users.by_username(
        test_config.backend_default_user_name
    )
    assert user is not None
    session = data_generator.sessions.session(
        user_id=user.id,
        expires_at=datetime.now(UTC) - timedelta(hours=1),
    )
    await db_operations.sessions.insert(session)

    test_client.cookies = {"session_token": session.token}
    response = await test_client.get("/api/auth/me")
    assert response.status_code == 404


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
