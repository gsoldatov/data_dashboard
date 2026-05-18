"""
Test configuration and fixtures for dashboard_backend tests.
"""

import asyncio
import sys
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config as AlembicConfig
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncConnection, AsyncEngine, create_async_engine

# Ensure project root is on sys.path so sibling-package imports work.
_PROJECT_ROOT = Path(__file__).parents[2]
if str(_PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(_PROJECT_ROOT))

from fastapi import FastAPI  # noqa: E402

from dashboard_backend.src.app import create_app  # noqa: E402
from dashboard_backend.tests.mocks.data_generator import DataGenerator  # noqa: E402
from dashboard_backend.tests.mocks.db_operations import DBOperations  # noqa: E402
from python_common.src.config import Config, get_config  # noqa: E402
from python_common.tests.shared_fixtures import create_temp_directory  # noqa: E402

_TESTS_DIR = Path(__file__).parent
_ALEMBIC_INI = (
    _PROJECT_ROOT / "dashboard_backend" / "src" / "db" / "migrations" / "alembic.ini"
)


# ── shared temp-directory fixture ──────────────────────────────────────────


@pytest.fixture
def temp_directory(request: pytest.FixtureRequest) -> Path:
    """Unique temporary directory under dashboard_backend/tests/temp."""
    return create_temp_directory(_TESTS_DIR, request.node.name)


# ── config ─────────────────────────────────────────────────────────────────


@pytest.fixture
def test_config(temp_directory: Path) -> Config:
    """Config based on ``config.env.example`` with test-specific overrides.

    Database and data/log directories are redirected into *temp_directory*.
    """
    config = get_config("config.env.example")
    config.data_directory = temp_directory / "data"
    config.logs_directory = temp_directory / "logs"
    config.backend_database_path = temp_directory / "test.db"
    config.backend_default_user_name = "test_admin"
    config.backend_default_user_password = "test_admin_pass"
    config.backend_session_ttl_seconds = 3600
    config.backend_cors_origins = "*"
    return config


# ── database ───────────────────────────────────────────────────────────────


@pytest.fixture
async def test_db(test_config: Config) -> AsyncGenerator[AsyncConnection]:
    """Async generator: create engine → run Alembic migrations → yield connection.

    The engine is disposed when the test finishes.  Migrations are executed
    in a thread so that ``asyncio.run()`` inside env.py does not clash with
    pytest-asyncio's event loop.
    """
    engine = create_async_engine(
        test_config.backend_database_url, echo=False, isolation_level="AUTOCOMMIT"
    )

    try:
        # Run migrations against the test database
        alembic_cfg = AlembicConfig(str(_ALEMBIC_INI))
        alembic_cfg.attributes["custom_config"] = test_config
        await asyncio.to_thread(command.upgrade, alembic_cfg, "head")

        async with engine.connect() as conn:
            yield conn
    finally:
        await engine.dispose()


# ── application ────────────────────────────────────────────────────────────


@pytest.fixture
async def test_app(
    test_config: Config, test_db: AsyncConnection
) -> AsyncGenerator[FastAPI]:
    """FastAPI app wired to the test config and migrated database.

    Uses ``create_app()`` for route/CORS setup but manages the engine
    manually so the production lifespan (which calls ``asyncio.run()``)
    does not clash with pytest-asyncio's event loop.
    *test_db* ensures migrations have already been applied.
    """
    app = create_app(test_config)
    engine = create_async_engine(test_config.backend_database_url, echo=False)
    app.state.engine = engine

    yield app

    await engine.dispose()


@pytest.fixture
async def test_client(test_app: FastAPI) -> AsyncGenerator[AsyncClient]:
    """httpx async client pointed at *test_app*."""
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


# ── test helpers ───────────────────────────────────────────────────────────


@pytest.fixture
def data_generator() -> DataGenerator:
    """DataGenerator facade for creating Pydantic objects / request bodies."""
    return DataGenerator()


@pytest.fixture
def db_operations(test_db: AsyncConnection) -> DBOperations:
    """DBOperations facade wired to the migrated test connection."""
    return DBOperations(test_db)


# ── session fixtures ──────────────────────────────────────────────────────


@pytest.fixture
async def admin_session(
    test_config: Config,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> dict[str, str]:
    """Session cookie for the default admin user (seeded by migration)."""
    user = await db_operations.users.by_username(
        test_config.backend_default_user_name
    )
    assert user is not None, "Default admin user not found"
    session = data_generator.sessions.session(user_id=user.id)
    await db_operations.sessions.insert(session)
    return {"session_token": session.token}


@pytest.fixture
async def viewer_session(
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> tuple[int, dict[str, str]]:
    """Create a viewer user + session, return (user_id, cookie_dict)."""
    user = await db_operations.users.insert(
        data_generator.users.user_create(
            username="viewer", password="pass", role="viewer"
        )
    )
    session = data_generator.sessions.session(user_id=user.id)
    await db_operations.sessions.insert(session)
    return user.id, {"session_token": session.token}
