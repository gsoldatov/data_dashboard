"""Test cases for POST /api/auth/logout."""

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


async def test_logout_no_cookie(test_client: AsyncClient) -> None:
    response = await test_client.post(
        "/api/auth/logout",
        cookies={},
    )
    assert response.status_code == 204


async def test_logout_invalid_token(test_client: AsyncClient) -> None:
    response = await test_client.post(
        "/api/auth/logout",
        cookies={"session_token": "nonexistent_token"},
    )
    assert response.status_code == 204


async def test_logout_valid_token(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    # Create a separate session so we can verify it's deleted
    user = await db_operations.users.by_username("test_admin")
    assert user is not None
    session = data_generator.sessions.session(
        user_id=user.id, token="logout_test_token"
    )
    await db_operations.sessions.insert(session)

    response = await test_client.post(
        "/api/auth/logout",
        cookies={"session_token": session.token},
    )

    assert response.status_code == 204
    # Cookie should be cleared
    assert (
        "session_token" not in response.cookies
        or response.cookies["session_token"] == ""
    )
    # Session should be deleted from DB
    deleted = await db_operations.sessions.by_token(session.token)
    assert deleted is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
