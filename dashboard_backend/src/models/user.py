"""Pydantic API schemas for User entity."""

from datetime import datetime
from typing import Annotated, Literal

from pydantic import BaseModel, Field

from dashboard_backend.src.models.common import AnyOf

UsernameField = Annotated[str, Field(min_length=1, max_length=255)]
PasswordField = Annotated[str, Field(min_length=1, max_length=255)]


class UserCreate(BaseModel):
    """Payload for creating a new user."""
    username: UsernameField
    password: PasswordField
    role: Literal["admin", "viewer"]


class UserUpdate(AnyOf, BaseModel):
    """Payload for updating an existing user."""
    username: UsernameField | None = None
    password: PasswordField | None = None
    role: Literal["admin", "viewer"] | None = None


class UserResponse(BaseModel):
    """Public-facing user representation (password excluded)."""
    id: int
    username: str
    role: str
    created_at: datetime


class User(BaseModel):
    """Full SA model counterpart (password_hash excluded)."""
    model_config = {"from_attributes": True}

    id: int
    username: str
    role: str
    created_at: datetime
