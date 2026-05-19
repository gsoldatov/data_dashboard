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
from dashboard_backend.src.services.page_settings import resolve_page_settings

router = APIRouter(tags=["page-settings"])


@router.get("/{slug}", response_model=PageSettingsResponse)
async def read_page_settings(
    slug: str,
    _current: User = Depends(admin_user),
    repo: Repository = Depends(get_repo),
) -> PageSettingsResponse:
    """Return current page settings, merging defaults with stored overrides."""
    return await resolve_page_settings(slug, repo)


@router.put("/{slug}", response_model=PageSettings)
async def upsert_page_settings(
    slug: str,
    data: PageSettingsUpsert,
    _current: User = Depends(admin_user),
    repo: Repository = Depends(get_repo),
) -> PageSettings:
    """Insert or update page settings for a slug (admin only)."""
    return await repo.pages_settings.upsert(slug, data)
