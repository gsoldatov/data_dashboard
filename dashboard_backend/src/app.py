"""FastAPI application factory."""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from python_common.src.config import Config, get_config

from dashboard_backend.src.db.connection import init_db, close_db, get_session
from dashboard_backend.src.db import Repository
from dashboard_backend.src.routes import setup_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and tear down database connections."""
    config: Config = app.state.config
    init_db(config.backend_database_url)
    yield
    await close_db()


def create_app(config: Config | None = None) -> FastAPI:
    """Build and return the configured FastAPI application."""
    config = config or get_config()

    app = FastAPI(
        title="Data Dashboard API",
        lifespan=lifespan,
    )
    app.state.config = config

    # Routes
    setup_routes(app)

    # CORS
    origins = [o.strip() for o in config.backend_cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app


async def get_repo(session: AsyncSession = Depends(get_session)) -> AsyncGenerator[Repository, None]:
    """FastAPI dependency: yield a Repository facade bound to the current session."""
    yield Repository(session)
