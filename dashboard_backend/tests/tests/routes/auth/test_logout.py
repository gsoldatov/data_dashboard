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
from python_common.src.config import Config


async def test_logout_no_cookie(
    test_client: AsyncClient,
    test_config: Config,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    admin = await db_operations.users.by_username(
        test_config.backend_default_user_name
    )
    assert admin is not None
    session = data_generator.sessions.session(
        user_id=admin.id, token="no_cookie_test_token"
    )
    await db_operations.sessions.insert(session)

    test_client.cookies.clear()
    response = await test_client.post(
        "/api/auth/logout",
    )
    assert response.status_code == 204

    sessions = await db_operations.sessions.get_user_sessions(admin.id)
    assert len(sessions) == 1
    assert sessions[0].token == session.token


async def test_logout_invalid_token(
    test_client: AsyncClient,
    test_config: Config,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    admin = await db_operations.users.by_username(
        test_config.backend_default_user_name
    )
    assert admin is not None
    session = data_generator.sessions.session(
        user_id=admin.id, token="invalid_token_test_session"
    )
    await db_operations.sessions.insert(session)

    test_client.cookies = {"session_token": "nonexistent_token"}
    response = await test_client.post(
        "/api/auth/logout",
    )
    assert response.status_code == 204

    sessions = await db_operations.sessions.get_user_sessions(admin.id)
    assert len(sessions) == 1
    assert sessions[0].token == session.token


async def test_logout_valid_token(
    test_config: Config,
    test_client: AsyncClient,
    admin_session: dict[str, str],
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    # Create a separate session so we can verify it's deleted
    user = await db_operations.users.by_username(test_config.backend_default_user_name)
    assert user is not None
    session = data_generator.sessions.session(
        user_id=user.id, token="logout_test_token"
    )
    await db_operations.sessions.insert(session)

    test_client.cookies = {"session_token": session.token}
    response = await test_client.post(
        "/api/auth/logout",
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
    # User's sessions should only contain the admin_session fixture session
    user_sessions = await db_operations.sessions.get_user_sessions(user.id)
    assert len(user_sessions) == 1
    assert user_sessions[0].token == admin_session["session_token"]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
