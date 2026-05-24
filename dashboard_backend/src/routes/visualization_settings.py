"""Visualization settings routes."""

from fastapi import APIRouter, Depends
from fastapi.responses import Response

from dashboard_backend.src.db.repository import Repository, get_repo
from dashboard_backend.src.models.user import User
from dashboard_backend.src.models.visualization_settings import (
    VisualizationSettings,
    VisualizationSettingsResponse,
    VisualizationSettingsUpsert,
)
from dashboard_backend.src.services.auth import admin_user, current_user
from dashboard_backend.src.services.visualization_settings import (
    resolve_visualization_settings,
)

router = APIRouter(tags=["visualization-settings"])


@router.get("/{slug}", response_model=VisualizationSettingsResponse)
async def read_visualization_settings(
    slug: str,
    _current: User = Depends(admin_user),
    repo: Repository = Depends(get_repo),
) -> VisualizationSettingsResponse:
    """Return current visualization settings, merging defaults with stored overrides."""
    return await resolve_visualization_settings(slug, repo)


@router.put("/{slug}", response_model=VisualizationSettings)
async def upsert_visualization_settings(
    slug: str,
    data: VisualizationSettingsUpsert,
    _current: User = Depends(admin_user),
    repo: Repository = Depends(get_repo),
) -> VisualizationSettings:
    """Insert or update visualization settings for a slug (admin only)."""
    return await repo.visualizations_settings.upsert(slug, data)


@router.get("/{slug}/is-published")
async def read_is_published(
    slug: str,
    current: User | None = Depends(current_user),
    repo: Repository = Depends(get_repo),
) -> Response:
    """Check whether a visualization can be displayed.

    Returns 200 if the current user is an admin or the visualization is
    published, otherwise returns 403.
    """
    settings = await resolve_visualization_settings(slug, repo)

    if current is not None and current.role == "admin":
        return Response(status_code=200)
    if settings.is_published:
        return Response(status_code=200)
    return Response(status_code=403)
