"""Auth service — session validation and utilities."""

import secrets
from datetime import datetime, timezone

from fastapi import HTTPException, Request

from dashboard_backend.src.db import Repository


def generate_token() -> str:
    # TODO use or remove
    """Generate a cryptographically random session token."""
    return secrets.token_hex(32)


async def get_current_user(request: Request, repo: Repository) -> int:
    """FastAPI dependency: validate session cookie and return user_id.

    Raises HTTPException(401) on missing, expired, or invalid sessions.
    """
    # TODO
    # - use this function in dependency or remove
    # ? prolong session, if it's valid
    token: str | None = request.cookies.get("session_token")
    if token is None:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = await repo.sessions.by_token(token)
    if session is None:
        raise HTTPException(status_code=401, detail="Invalid session")

    if session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")

    return session.user_id
