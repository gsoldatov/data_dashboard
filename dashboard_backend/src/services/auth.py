"""Auth service — session validation and user dependencies."""
from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, Request

from dashboard_backend.src.db.repository import Repository, get_repo
from dashboard_backend.src.models.user import User


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
    await repo.sessions.prolong(
        session,
        datetime.now(UTC) + timedelta(seconds=ttl),
    )

    user = await repo.users.by_id(session.user_id)
    if user is None:
        return None

    return user


async def admin_user(
    current: User | None = Depends(current_user),
) -> User:
    """Return the authenticated admin User; raises 401/403 on failure."""
    if current is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if current.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current


async def self_or_admin(
    user_id: int,
    current: User | None = Depends(current_user),
) -> User:
    """Return the authenticated User if admin or the target user; 401/403 otherwise."""
    if current is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if current.role != "admin" and current.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current
