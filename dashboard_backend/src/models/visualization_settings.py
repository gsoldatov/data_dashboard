"""Pydantic API schemas for VisualizationSettings entity."""

from typing import Annotated

from pydantic import BaseModel, Field

SlugField = Annotated[str, Field(min_length=1, max_length=255)]


class VisualizationSettingsUpsert(BaseModel):
    """Payload for creating or updating visualization settings."""

    is_published: bool


class VisualizationSettingsResponse(BaseModel):
    """Public visualization settings (merged defaults + overrides)."""

    slug: str
    is_published: bool


class VisualizationSettings(BaseModel):
    """Full SA model counterpart."""

    model_config = {"from_attributes": True}

    id: int
    slug: str
    is_published: bool


class VisualizationSettingsValues(BaseModel):
    """Settings values returned in a batch query (extensible per setting name)."""

    is_published: bool
