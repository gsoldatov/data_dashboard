"""Visualization settings routes."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from dashboard_backend.src.db.repository import Repository
from dashboard_backend.src.models.user import User
from dashboard_backend.src.models.visualization_settings import (
    VisualizationSettings,
    VisualizationSettingsResponse,
    VisualizationSettingsUpsert,
    VisualizationSettingsValues,
)
from dashboard_backend.src.services.auth import admin_user
from dashboard_backend.src.services.visualization_data.constants import SLUGS
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
    _validate_slugs([slug])
    repo: Repository = request.state.repository
    resolved = await resolve_visualization_settings([slug], repo)
    return resolved[slug]


@router.put("/{slug}", response_model=VisualizationSettings)
async def upsert_visualization_settings(
    slug: str,
    data: VisualizationSettingsUpsert,
    request: Request,
    _current: User = Depends(admin_user),
) -> VisualizationSettings:
    """Insert or update visualization settings for a slug (admin only)."""
    _validate_slugs([slug])
    repo: Repository = request.state.repository
    return await repo.visualizations_settings.upsert(slug, data)


@router.get("/", response_model=dict[str, VisualizationSettingsValues])
async def read_visualization_settings_batch(
    settings: Annotated[str, Query(min_length=1)],
    slugs: Annotated[str, Query(min_length=1)],
    request: Request,
) -> dict[str, VisualizationSettingsValues]:
    """Return settings for the requested slugs.

    Query parameters:
    - ``settings``: comma-separated setting names (e.g. ``is-published``).
    - ``slugs``: comma-separated visualization slugs.
    """
    setting_names = _parse_comma_separated(settings)
    slugs_list = _parse_comma_separated(slugs)

    _validate_setting_names(setting_names)
    _validate_slugs(slugs_list)

    repo: Repository = request.state.repository
    # NOTE: add logic for returning only specified settings,
    # when there's more than one setting to return
    resolved = await resolve_visualization_settings(slugs_list, repo)

    result: dict[str, VisualizationSettingsValues] = {}
    for slug in slugs_list:
        result[slug] = VisualizationSettingsValues(
            is_published=resolved[slug].is_published,
        )
    return result


def _parse_comma_separated(raw: str) -> list[str]:
    """Split a comma-separated query parameter into a list of non-empty values."""
    return [v.strip() for v in raw.split(",") if v.strip()]


_VALID_SETTINGS = frozenset({"is-published"})


def _validate_setting_names(names: list[str]) -> None:
    """Raise a 422 if any requested setting name is unknown."""
    for name in names:
        if name not in _VALID_SETTINGS:
            raise HTTPException(
                status_code=422,
                detail=f"Unknown setting: {name}",
            )


def _validate_slugs(slugs: list[str]) -> None:
    """Raise a 404 if any slug is not a known visualization slug."""
    for slug in slugs:
        if slug not in SLUGS:
            raise HTTPException(
                status_code=404,
                detail=f"Unknown visualization slug: {slug}",
            )
