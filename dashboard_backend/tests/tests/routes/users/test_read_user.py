"""Test cases for GET /api/users/{user_id}."""

import sys
from pathlib import Path

import pytest
from httpx import AsyncClient

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[6]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from dashboard_backend.tests.mocks.db_operations import DBOperations  # noqa: E402
from python_common.src.config import Config  # noqa: E402

# ── not found ─────────────────────────────────────────────────────────────


async def test_read_user_not_found(test_client: AsyncClient) -> None:
    response = await test_client.get("/api/users/99999")
    assert response.status_code == 404


# ── success ───────────────────────────────────────────────────────────────


async def test_read_user_success(
    test_client: AsyncClient,
    test_config: Config,
    db_operations: DBOperations,
) -> None:
    user = await db_operations.users.by_username(
        test_config.backend_default_user_name
    )
    assert user is not None

    response = await test_client.get(f"/api/users/{user.id}")

    assert response.status_code == 200
    body = response.json()
    assert body["id"] == user.id
    assert body["username"] == test_config.backend_default_user_name
    assert body["role"] == "admin"
    assert "created_at" in body
    assert "password" not in body
    assert "password_hash" not in body


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
