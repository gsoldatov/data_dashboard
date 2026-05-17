"""
Test cases for Alembic migrations.
"""
import asyncio
import sys
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config as AlembicConfig
from sqlalchemy import inspect as sa_inspect
from sqlalchemy.engine import Connection as SyncConnection
from sqlalchemy.ext.asyncio import AsyncConnection, create_async_engine

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from dashboard_backend.src.db.models import Base  # noqa: E402
from dashboard_backend.src.util.passwords import verify_password  # noqa: E402
from dashboard_backend.tests.mocks.db_operations import DBOperations  # noqa: E402
from python_common.src.config import Config  # noqa: E402

_ALEMBIC_INI = (
    PROJECT_ROOT / "dashboard_backend" / "src" / "db" / "migrations" / "alembic.ini"
)


# ── helpers ────────────────────────────────────────────────────────────────


def _collect_db_columns(conn: SyncConnection) -> dict[str, set[str]]:
    """Return {table_name: {column_name, ...}} from a live database."""
    inspector = sa_inspect(conn)
    return {
        table: {col["name"] for col in inspector.get_columns(table)}
        for table in inspector.get_table_names()
    }


# ── upgrade → downgrade → upgrade ─────────────────────────────────────────


async def test_upgrade_downgrade_upgrade(test_config: Config) -> None:
    """Upgrade to head, downgrade to base, then upgrade again — no errors."""
    engine = create_async_engine(test_config.backend_database_url, echo=False)

    try:
        alembic_cfg = AlembicConfig(str(_ALEMBIC_INI))
        alembic_cfg.attributes["custom_config"] = test_config

        # Arrange & Act: upgrade → downgrade → upgrade
        await asyncio.to_thread(command.upgrade, alembic_cfg, "head")
        await asyncio.to_thread(command.downgrade, alembic_cfg, "base")
        await asyncio.to_thread(command.upgrade, alembic_cfg, "head")

        # Assert: reaching this point without exception is success
        async with engine.connect() as conn:
            db_tables: dict[str, set[str]] = await conn.run_sync(
                _collect_db_columns
            )
        assert db_tables, "Database should have tables after upgrade"
    finally:
        await engine.dispose()


# ── ORM ↔ DB schema parity ────────────────────────────────────────────────


async def test_orm_matches_db_after_migration(test_db: AsyncConnection) -> None:
    """Every ORM table and column exists in the migrated database."""
    # Arrange: read ORM metadata
    orm_tables: dict[str, set[str]] = {}
    for table_name, table in Base.metadata.tables.items():
        orm_tables[table_name] = {c.name for c in table.columns}

    # Act: collect actual DB columns (skip alembic_version housekeeping table)
    db_tables: dict[str, set[str]] = await test_db.run_sync(
        _collect_db_columns
    )
    db_tables.pop("alembic_version", None)

    # Assert
    assert orm_tables, "ORM metadata should contain tables"
    for table_name, orm_columns in orm_tables.items():
        assert table_name in db_tables, (
            f"Table '{table_name}' missing from database"
        )
        db_columns = db_tables[table_name]
        missing = orm_columns - db_columns
        assert not missing, (
            f"Columns {missing} in ORM '{table_name}' not found in database"
        )
        extra = db_columns - orm_columns
        assert not extra, (
            f"Columns {extra} in database '{table_name}' not found in ORM"
        )


# ── default admin user ────────────────────────────────────────────────────


async def test_default_admin_user_created(
    test_config: Config, db_operations: DBOperations
) -> None:
    """Migration seeds the configured default admin user with valid password."""
    expected_username = test_config.backend_default_user_name
    expected_password = test_config.backend_default_user_password

    # Act
    result = await db_operations.users.by_username_with_hash(expected_username)

    # Assert
    assert result is not None, (
        f"Default admin user '{expected_username}' not found"
    )
    user, password_hash = result
    assert user.username == expected_username
    assert user.role == "admin"
    assert verify_password(expected_password, password_hash), (
        "Stored password hash does not match expected password"
    )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
