"""Pydantic API schemas for Session entity."""

from datetime import datetime
from pydantic import BaseModel

from dashboard_backend.src.models.user import UsernameField, PasswordField


class LoginRequest(BaseModel):
    """Payload for login."""

    username: UsernameField
    password: PasswordField


class SessionResponse(BaseModel):
    """Public-facing session representation (token excluded)."""

    user_id: int
    expires_at: datetime
