"""Shared helpers for visualization-settings resolution."""

from dashboard_backend.src.db.repository import Repository
from dashboard_backend.src.models.visualization_settings import (
    VisualizationSettingsResponse,
)

_DEFAULTS: dict[str, object] = {"is_published": True}


async def resolve_visualization_settings(
    slugs: list[str], repo: Repository
) -> dict[str, VisualizationSettingsResponse]:
    """Return visualization settings for each slug, merged from defaults and
    stored overrides.  Slugs without a stored row receive default values."""
    stored_list = await repo.visualizations_settings.by_slugs(slugs)
    stored_by_slug = {s.slug: s for s in stored_list}

    result: dict[str, VisualizationSettingsResponse] = {}
    for slug in slugs:
        stored = stored_by_slug.get(slug)
        settings: dict[str, object] = dict(_DEFAULTS, slug=slug)
        if stored is not None:
            settings["is_published"] = stored.is_published
        result[slug] = VisualizationSettingsResponse.model_validate(settings)
    return result
