"""Pydantic API schemas for PageSettings entity."""

from typing import Annotated

from pydantic import BaseModel, Field


SlugField = Annotated[str, Field(min_length=1, max_length=255)]


class PageSettingsUpsert(BaseModel):
    """Payload for creating or updating page settings."""

    slug: SlugField
    is_published: bool
