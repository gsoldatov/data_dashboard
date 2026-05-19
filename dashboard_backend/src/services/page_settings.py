"""Shared helpers for page-settings resolution."""

from dashboard_backend.src.db.repository import Repository
from dashboard_backend.src.models.page_settings import PageSettingsResponse

_DEFAULTS: dict[str, object] = {"is_published": True}


async def resolve_page_settings(
    slug: str, repo: Repository
) -> PageSettingsResponse:
    """Return page settings merged from defaults and stored overrides."""
    stored = await repo.pages_settings.by_slug(slug)

    settings: dict[str, object] = dict(_DEFAULTS, slug=slug)
    if stored is not None:
        settings["is_published"] = stored.is_published

    return PageSettingsResponse.model_validate(settings)
