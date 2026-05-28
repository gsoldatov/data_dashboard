"""Visualization settings routes."""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import Response

from dashboard_backend.src.db.repository import Repository
from dashboard_backend.src.models.user import User
from dashboard_backend.src.models.visualization_settings import (
    VisualizationSettings,
    VisualizationSettingsResponse,
    VisualizationSettingsUpsert,
)
from dashboard_backend.src.services.auth import admin_user
from dashboard_backend.src.services.visualization_settings import (
    resolve_visualization_settings,
)

router = APIRouter(tags=["visualization-settings"])


@router.get("/{slug}", response_model=VisualizationSettingsResponse)
async def read_visualization_settings(
    slug: str,
    request: Request,
    _current: User = Depends(admin_user),
) -> VisualizationSettingsResponse:
    """Return current visualization settings, merging defaults with stored overrides."""
    repo: Repository = request.state.repository
    return await resolve_visualization_settings(slug, repo)


@router.put("/{slug}", response_model=VisualizationSettings)
async def upsert_visualization_settings(
    slug: str,
    data: VisualizationSettingsUpsert,
    request: Request,
    _current: User = Depends(admin_user),
) -> VisualizationSettings:
    """Insert or update visualization settings for a slug (admin only)."""
    repo: Repository = request.state.repository
    return await repo.visualizations_settings.upsert(slug, data)


@router.get("/{slug}/is-published")
async def read_is_published(
    slug: str,
    request: Request,
) -> Response:
    """Check whether a visualization can be displayed.

    Returns 200 if the current user is an admin or the visualization is
    published, otherwise returns 403.
    """
    current: User | None = request.state.current_user
    repo: Repository = request.state.repository
    settings = await resolve_visualization_settings(slug, repo)

    if current is not None and current.role == "admin":
        return Response(status_code=200)
    if settings.is_published:
        return Response(status_code=200)
    return Response(status_code=403)
