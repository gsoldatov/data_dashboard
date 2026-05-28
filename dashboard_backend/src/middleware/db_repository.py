"""Middleware that creates a Repository-bound DB session for every request."""

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from dashboard_backend.src.db.repository import Repository


class DBRepositoryMiddleware(BaseHTTPMiddleware):
    """
    Adds a DB repository object to request's state
    and commits the changes it made inside the `AsyncSession` it used
    (or rolls them back in case of errors).
    """

    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        engine: AsyncEngine = request.app.state.engine
        async with AsyncSession(engine) as session:
            request.state.repository = Repository(session)
            response = await call_next(request)
            await session.commit()
        return response
