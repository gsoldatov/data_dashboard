"""Test cases for scheduled expired session cleanup."""

import asyncio
import sys
from datetime import UTC, datetime, timedelta
from pathlib import Path

import pytest

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[4]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI

from dashboard_backend.tests.mocks.data_generator import DataGenerator
from dashboard_backend.tests.mocks.db_operations import DBOperations


async def test_scheduler_cleans_up_expired_sessions(
    test_app: FastAPI,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """Scheduler fires autonomously and deletes expired sessions."""
    expired = data_generator.sessions.session(
        id=30,
        token="x" * 64,
        expires_at=datetime.now(UTC) - timedelta(hours=1),
    )
    valid = data_generator.sessions.session(
        id=40,
        token="y" * 64,
        expires_at=datetime.now(UTC) + timedelta(hours=1),
    )
    await db_operations.sessions.insert(expired)
    await db_operations.sessions.insert(valid)

    async with test_app.router.lifespan_context(test_app):
        for _ in range(50):
            sessions = await db_operations.sessions.get_user_sessions(1)
            if len(sessions) == 1:
                if sessions[0].token != valid.token:
                    raise AssertionError("Valid token was removed.")
                break
            await asyncio.sleep(0.1)
        else:
            raise AssertionError(
                "Scheduler did not clean up expired sessions within 5 s"
            )

    sessions = await db_operations.sessions.get_user_sessions(1)
    assert len(sessions) == 1
    assert sessions[0].token == valid.token


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
