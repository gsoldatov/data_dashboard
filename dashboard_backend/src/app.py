"""FastAPI application factory."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from dashboard_backend.src.db.engine import close_engine, init_engine
from dashboard_backend.src.middleware.auth import AuthMiddleware
from dashboard_backend.src.middleware.db_repository import DBRepositoryMiddleware
from dashboard_backend.src.routes import setup_routes
from dashboard_backend.src.scheduled import setup_scheduler
from dashboard_backend.src.util.exceptions import (
    ApplicationException,
    DuplicateException,
    InvalidCredentialsException,
    NotFoundException,
    VisualizationDataNotFoundException,
)
from python_common.src.config import Config, get_config


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None]:
    # Scheduler for periodic jobs
    scheduler = setup_scheduler(app)
    app.state.scheduler = scheduler
    try:
        yield
    finally:
        scheduler.shutdown(wait=True)
        await close_engine(app)


def create_app(config: Config | None = None) -> FastAPI:
    """Build and return the configured FastAPI application."""
    config = config or get_config()

    app = FastAPI(
        title="Data Dashboard API",
        lifespan=lifespan,
    )
    app.state.config = config

    # Database engine (with WAL + busy timeout for concurrent access)
    init_engine(app)

    # Routes
    setup_routes(app)

    # Exception handlers
    @app.exception_handler(NotFoundException)
    async def not_found_handler(
        _request: Request, exc: NotFoundException
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(VisualizationDataNotFoundException)
    async def visualization_data_not_found_handler(
        _request: Request, exc: VisualizationDataNotFoundException
    ) -> JSONResponse:
        return JSONResponse(status_code=404, content={"detail": str(exc)})

    @app.exception_handler(ApplicationException)
    async def application_error_handler(
        _request: Request, exc: ApplicationException
    ) -> JSONResponse:
        return JSONResponse(status_code=500, content={"detail": str(exc)})

    @app.exception_handler(DuplicateException)
    async def duplicate_handler(
        _request: Request, exc: DuplicateException
    ) -> JSONResponse:
        return JSONResponse(status_code=409, content={"detail": str(exc)})

    @app.exception_handler(InvalidCredentialsException)
    async def invalid_credentials_handler(
        _request: Request, exc: InvalidCredentialsException
    ) -> JSONResponse:
        return JSONResponse(status_code=400, content={"detail": str(exc)})
    
    # Middleware (last added runs first)
    app.add_middleware(AuthMiddleware)
    app.add_middleware(DBRepositoryMiddleware)

    origins = [o.strip() for o in config.backend_cors_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return app
