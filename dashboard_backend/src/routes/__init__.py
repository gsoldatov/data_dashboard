from fastapi import FastAPI

from dashboard_backend.src.routes import page_settings, page_data, auth, users


def setup_routes(app: FastAPI) -> None:
    """Mount all routers on the application."""
    app.include_router(page_settings.router, prefix="/api/page-settings")
    app.include_router(page_data.router, prefix="/api/page-data")
    app.include_router(auth.router, prefix="/api/auth")
    app.include_router(users.router, prefix="/api/users")
