"""Auth service — session validation and user dependencies."""

import secrets
from datetime import datetime, timezone, timedelta

from fastapi import Depends, HTTPException, Request

from dashboard_backend.src.db.repository import Repository, get_repo
from dashboard_backend.src.models.user import User
from dashboard_backend.src.models.session import Session


def generate_token() -> str:
    """Generate a cryptographically random session token."""
    return secrets.token_hex(32)


async def current_user(
    request: Request,
    repo: Repository = Depends(get_repo),
) -> User | None:
    """Return the Pydantic User for a valid session cookie, or None."""
    token: str | None = request.cookies.get("session_token")
    if token is None:
        return None

    session = await repo.sessions.by_token(token)
    if session is None:
        return None

    # Prolong session lifetime
    ttl = request.app.state.config.backend_session_ttl_seconds
    pydantic_session = Session.model_validate(session)
    await repo.sessions.prolong(
        pydantic_session,
        datetime.now(timezone.utc) + timedelta(seconds=ttl),
    )

    # Get the user
    sa_user = await repo.users.by_id(session.user_id)
    if sa_user is None:
        return None

    return User.model_validate(sa_user)


async def admin_user(
    current: User | None = Depends(current_user),
) -> User:
    """Return the authenticated admin User; raises 401/403 on failure."""
    if current is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if current.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current
