"""Middleware that resolves the current user from the session cookie."""

from datetime import UTC, datetime, timedelta

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from dashboard_backend.src.db.repository import Repository
from dashboard_backend.src.models.user import User


class AuthMiddleware(BaseHTTPMiddleware):
    """
    Finds the user owning the session matching `session_token` cookie,
    prolong the session, it's valid and adds the user (or None) to request's state.
    """
    async def dispatch(
        self, request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        repo: Repository = request.state.repository
        user = await _resolve_user(request, repo)
        request.state.current_user = user
        return await call_next(request)


async def _resolve_user(
    request: Request, repo: Repository
) -> User | None:
    """
    Finds the user matching the `session_token` request cookie
    and prolongs the session, if it's valid.

    Returns the user owning the valid session or None.
    """
    token: str | None = request.cookies.get("session_token")
    if token is None:
        return None

    session = await repo.sessions.by_token(token)
    if session is None:
        return None

    # Prolong session lifetime
    ttl = request.app.state.config.backend_session_ttl_seconds
    await repo.sessions.prolong(
        session,
        datetime.now(UTC) + timedelta(seconds=ttl),
    )

    user = await repo.users.by_id(session.user_id)
    return user
