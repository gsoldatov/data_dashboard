"""Test cases for AuthMiddleware X-Is-Authenticated header."""

import sys
from pathlib import Path

import pytest
from httpx import AsyncClient

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from datetime import UTC, datetime, timedelta

from dashboard_backend.tests.mocks.data_generator import DataGenerator
from dashboard_backend.tests.mocks.db_operations import DBOperations
from python_common.src.config import Config


async def test_header_no_cookie(test_client: AsyncClient) -> None:
    test_client.cookies.clear()
    response = await test_client.get("/api/auth/me")
    assert response.headers["x-is-authenticated"] == "false"


async def test_header_invalid_token(test_client: AsyncClient) -> None:
    test_client.cookies = {"session_token": "nonexistent_token"}
    response = await test_client.get("/api/auth/me")
    assert response.headers["x-is-authenticated"] == "false"


async def test_header_valid_session(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    response = await test_client.get("/api/auth/me")
    assert response.headers["x-is-authenticated"] == "true"


async def test_header_expired_session(
    test_config: Config,
    test_client: AsyncClient,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """An expired session cookie should result in X-Is-Authenticated: false."""
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
    assert response.headers["x-is-authenticated"] == "false"


async def test_header_public_route(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    """The header should be set on public routes too."""
    test_client.cookies = admin_session
    response = await test_client.get("/api/users/1")
    assert response.headers["x-is-authenticated"] == "true"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
