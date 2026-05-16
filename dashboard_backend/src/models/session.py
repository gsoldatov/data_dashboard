"""Pydantic API schemas for Session entity."""

from datetime import datetime

from pydantic import BaseModel

from dashboard_backend.src.models.user import PasswordField, UsernameField


class LoginRequest(BaseModel):
    """Payload for login."""

    username: UsernameField
    password: PasswordField


class SessionResponse(BaseModel):
    """Public-facing session representation (token excluded)."""

    user_id: int
    expires_at: datetime


class Session(BaseModel):
    """Full SA model counterpart."""

    model_config = {"from_attributes": True}

    id: int
    user_id: int
    token: str
    expires_at: datetime
    created_at: datetime
