"""Pydantic API schemas for PageSettings entity."""

from typing import Annotated

from pydantic import BaseModel, Field

SlugField = Annotated[str, Field(min_length=1, max_length=255)]


class PageSettingsUpsert(BaseModel):
    """Payload for creating or updating page settings."""

    is_published: bool


class PageSettingsResponse(BaseModel):
    """Public page settings (merged defaults + overrides)."""

    slug: str
    is_published: bool


class PageSettings(BaseModel):
    """Full SA model counterpart."""

    model_config = {"from_attributes": True}

    id: int
    slug: str
    is_published: bool
