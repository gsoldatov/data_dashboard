"""Async SQLite engine and session management."""
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, create_async_engine


def init_db(app: FastAPI) -> None:
    """Create async engine and store it in app state."""
    config = app.state.config
    app.state.engine = create_async_engine(config.backend_database_url, echo=False)


async def close_db(app: FastAPI) -> None:
    """Dispose the engine stored in app state."""
    engine: AsyncEngine | None = getattr(app.state, "engine", None)
    if engine is not None:
        await engine.dispose()


async def get_session(request: Request) -> AsyncGenerator[AsyncSession, None]:
    """Yield an async session from the engine stored in app state."""
    engine: AsyncEngine = request.app.state.engine
    async with AsyncSession(engine) as session:
        yield session
