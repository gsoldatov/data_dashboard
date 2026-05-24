"""Shared helpers for visualization-settings resolution."""

from dashboard_backend.src.db.repository import Repository
from dashboard_backend.src.models.visualization_settings import (
    VisualizationSettingsResponse,
)

_DEFAULTS: dict[str, object] = {"is_published": True}


async def resolve_visualization_settings(
    slug: str, repo: Repository
) -> VisualizationSettingsResponse:
    """Return visualization settings merged from defaults and stored overrides."""
    stored = await repo.visualizations_settings.by_slug(slug)

    settings: dict[str, object] = dict(_DEFAULTS, slug=slug)
    if stored is not None:
        settings["is_published"] = stored.is_published

    return VisualizationSettingsResponse.model_validate(settings)
