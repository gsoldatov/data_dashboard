"""Page settings routes."""

from fastapi import APIRouter, Depends

from dashboard_backend.src.db.repository import Repository, get_repo
from dashboard_backend.src.models.page_settings import (
    PageSettings,
    PageSettingsResponse,
    PageSettingsUpsert,
)
from dashboard_backend.src.models.user import User
from dashboard_backend.src.services.auth import admin_user

router = APIRouter(tags=["page-settings"])

_DEFAULTS: dict[str, object] = {"is_published": True}


@router.get("/{slug}", response_model=PageSettingsResponse)
async def read_page_settings(
    slug: str,
    _current: User = Depends(admin_user),
    repo: Repository = Depends(get_repo),
) -> PageSettingsResponse:
    """Return current page settings, merging defaults with stored overrides."""
    stored = await repo.pages_settings.by_slug(slug)

    settings: dict[str, object] = dict(_DEFAULTS, slug=slug)
    if stored is not None:
        settings["is_published"] = stored.is_published

    return PageSettingsResponse.model_validate(settings)


@router.put("/{slug}", response_model=PageSettings)
async def upsert_page_settings(
    slug: str,
    data: PageSettingsUpsert,
    _current: User = Depends(admin_user),
    repo: Repository = Depends(get_repo),
) -> PageSettings:
    """Insert or update page settings for a slug (admin only)."""
    return await repo.pages_settings.upsert(slug, data)
