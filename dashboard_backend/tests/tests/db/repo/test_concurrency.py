"""Test cases for concurrent database access via the repository layer."""

import asyncio
import sys
from pathlib import Path

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI

from dashboard_backend.src.db.repository import Repository
from dashboard_backend.src.models.user import User
from dashboard_backend.tests.mocks.data_generator import DataGenerator
from dashboard_backend.tests.mocks.db_operations import DBOperations


async def test_concurrent_writes(
    test_app: FastAPI,
    data_generator: DataGenerator,
) -> None:
    """Writer A acquires the lock; writer B starts after a delay and must wait
    on the busy timeout until A commits and releases the lock."""
    engine = test_app.state.engine
    data_a = data_generator.users.user_create(username="concurrent_a")
    data_b = data_generator.users.user_create(username="concurrent_b")

    async def write_a() -> User:
        async with AsyncSession(engine) as session:
            repo = Repository(session)
            user = await repo.users.insert(data_a)
            await asyncio.sleep(0.3)  # hold the lock, when B attempts to write
            return user

    async def write_b() -> User:
        await asyncio.sleep(0.1)  # let writer A acquire the lock first
        async with AsyncSession(engine) as session:
            repo = Repository(session)
            return await repo.users.insert(data_b)

    user_a, user_b = await asyncio.gather(write_a(), write_b())

    assert user_a.username == "concurrent_a"
    assert user_b.username == "concurrent_b"


async def test_read_during_write(
    test_app: FastAPI,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """A reader queries while a writer holds the write lock — WAL enables this."""
    engine = test_app.state.engine

    await db_operations.users.insert(
        data_generator.users.user_create(username="existing")
    )

    async def write() -> None:
        async with AsyncSession(engine) as session:
            repo = Repository(session)
            await repo.users.insert(
                data_generator.users.user_create(username="new_one")
            )
            await asyncio.sleep(0.3)  # hold the lock, when reading session runs

    async def read() -> User | None:
        await asyncio.sleep(0.1)  # let writer acquire the lock first
        async with AsyncSession(engine) as session:
            repo = Repository(session)
            return await repo.users.by_username("existing")

    _, found_user = await asyncio.gather(write(), read())

    assert found_user is not None
    assert found_user.username == "existing"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
