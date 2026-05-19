"""Async SQLite engine and session management."""

from fastapi import FastAPI
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine


def init_db(app: FastAPI) -> None:
    """Create async engine and store it in app state.

    Configures the engine for concurrent access via WAL journal mode
    and a 5-second busy timeout.
    """
    config = app.state.config
    engine = create_async_engine(config.backend_database_url, echo=False)

    @event.listens_for(engine.sync_engine, "connect")
    def _set_sqlite_pragmas(dbapi_connection, _connection_record):  # type: ignore[no-untyped-def]
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA busy_timeout=5000")
        cursor.close()

    app.state.engine = engine


async def close_db(app: FastAPI) -> None:
    """Dispose the engine stored in app state."""
    engine: AsyncEngine | None = getattr(app.state, "engine", None)
    if engine is not None:
        await engine.dispose()
