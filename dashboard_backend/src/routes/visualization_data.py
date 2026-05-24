"""Visualization data fetching route."""

from typing import Any

from fastapi import APIRouter, Depends

from dashboard_backend.src.db.repository import Repository, get_repo
from dashboard_backend.src.models.user import User
from dashboard_backend.src.services.auth import current_user
from dashboard_backend.src.services.visualization_data import (
    VisualizationDataService,
    get_visualization_data_service,
)
from dashboard_backend.src.services.visualization_settings import (
    resolve_visualization_settings,
)
from dashboard_backend.src.util.exceptions import NotFoundException

router = APIRouter(tags=["visualization-data"])


@router.get("/{slug}")
async def read_visualization_data(
    slug: str,
    current: User | None = Depends(current_user),
    repo: Repository = Depends(get_repo),
    service: VisualizationDataService = Depends(
        get_visualization_data_service
    ),
) -> list[dict[str, Any]]:
    """Return visualization data for *slug*, if the visualization is published
    or the user is an admin.  Returns 404 when the visualization is not visible
    or no data getter exists."""
    if current is None or current.role != "admin":
        settings = await resolve_visualization_settings(slug, repo)
        if not settings.is_published:
            raise NotFoundException(
                f"Visualization not found: {slug}"
            )

    return await service.get(slug)
