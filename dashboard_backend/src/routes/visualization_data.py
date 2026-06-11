"""Visualization data fetching route."""

from typing import Any

from fastapi import APIRouter, Depends, Request

from dashboard_backend.src.db.repository import Repository
from dashboard_backend.src.models.user import User
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
    request: Request,
    service: VisualizationDataService = Depends(
        get_visualization_data_service
    ),
) -> list[dict[str, Any]]:
    """Return visualization data for *slug*, if the visualization is published
    or the user is an admin.  Returns 404 when the visualization is not visible
    or no data getter exists."""
    current: User | None = request.state.current_user
    repo: Repository = request.state.repository
    if current is None or current.role != "admin":
        resolved = await resolve_visualization_settings([slug], repo)
        if not resolved[slug].is_published:
            raise NotFoundException(
                f"Visualization not found: {slug}"
            )

    return await service.get(slug)
