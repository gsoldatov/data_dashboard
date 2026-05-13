from fastapi import FastAPI

from dashboard_backend.src.routes import pages, page_data, auth, users


def setup_routes(app: FastAPI) -> None:
    """Mount all routers on the application."""
    app.include_router(pages.router, prefix="/api/pages")
    app.include_router(page_data.router, prefix="/api/page-data")
    app.include_router(auth.router, prefix="/api/auth")
    app.include_router(users.router, prefix="/api/users")
