from fastapi import FastAPI

from dashboard_backend.src.routes import (
    auth,
    users,
    visualization_data,
    visualization_settings,
)


def setup_routes(app: FastAPI) -> None:
    """Mount all routers on the application."""
    app.include_router(
        visualization_settings.router, prefix="/api/visualization-settings"
    )
    app.include_router(
        visualization_data.router, prefix="/api/visualization-data"
    )
    app.include_router(auth.router, prefix="/api/auth")
    app.include_router(users.router, prefix="/api/users")
