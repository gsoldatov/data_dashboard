"""Visualization data fetching route."""

from fastapi import APIRouter, Depends, Query, Request

from dashboard_backend.src.db.repository import Repository
from dashboard_backend.src.models.user import User
from dashboard_backend.src.services.visualization_data import (
    VisualizationDataService,
    VisualizationDataset,
    get_visualization_data_service,
)
from dashboard_backend.src.services.visualization_settings import (
    resolve_visualization_settings,
)
from dashboard_backend.src.util.exceptions import NotFoundException

router = APIRouter(tags=["visualization-data"])


@router.get("/")
async def read_visualization_data(
    request: Request,
    datasets: str = Query(
        default="",
        description="Comma-separated dataset names to fetch.",
    ),
    service: VisualizationDataService = Depends(
        get_visualization_data_service
    ),
) -> dict[str, VisualizationDataset]:
    """Return visualization data for the requested datasets as a
    ``{name: data}`` mapping.

    For non-admin users every dataset must have at least one published
    consumer visualization.  Returns 404 when a dataset name is unknown
    or has no visible consumer."""
    # Parse, strip and deduplicate (preserving first-seen order).
    raw = [n.strip() for n in datasets.split(",") if n.strip()]
    names = list(dict.fromkeys(raw))

    if not names:
        return {}

    # Validate all dataset names are known.
    service.validate_names(names)

    # Visibility check for non-admin users.
    current: User | None = request.state.current_user
    if current is None or current.role != "admin":
        repo: Repository = request.state.repository
        consumer_slugs = service.get_consumer_slugs(names)
        resolved = await resolve_visualization_settings(
            list(consumer_slugs), repo
        )
        for name in names:
            entry = service._registry.get(name)
            consumers: list[str] = (
                entry["consumers"] if entry else []  # type: ignore[assignment]
            )
            visible = any(
                resolved[s].is_published
                for s in consumers
                if s in resolved
            )
            if not visible:
                raise NotFoundException(
                    f"Dataset not found: {name}"
                )

    # Fetch data.
    return await service.get_many(names)
