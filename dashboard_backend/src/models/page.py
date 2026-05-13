"""Pydantic API schemas for Page entity."""

from datetime import datetime
from typing import Annotated, Optional

from pydantic import BaseModel, Field

from dashboard_backend.src.models.common import AtLeastOneFieldSetMixin


SlugField = Annotated[str, Field(min_length=1, max_length=255)]
TitleField = Annotated[str, Field(min_length=1, max_length=255)]
DescriptionField = Annotated[Optional[str], Field(default=None, max_length=1024)]
TagsField = Annotated[Optional[str], Field(default=None, max_length=1024)]


class PageCreate(BaseModel):
    """Payload for creating a page."""
    slug: SlugField
    title: TitleField
    description: DescriptionField
    feed_timestamp: datetime | None = None
    is_published: bool
    tags: TagsField


class PageUpdate(AtLeastOneFieldSetMixin, BaseModel):
    """Payload for updating an existing page."""
    title: TitleField | None = None
    description: DescriptionField | None = None
    feed_timestamp: datetime | None = None
    is_published: bool | None = None
    tags: TagsField | None = None


class PageResponse(BaseModel):
    """Public-facing page representation."""
    id: int
    slug: str
    title: str
    description: str | None
    feed_timestamp: datetime | None
    is_published: bool
    tags: str | None
    created_at: datetime
    updated_at: datetime | None
