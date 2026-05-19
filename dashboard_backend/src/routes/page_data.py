"""Page data fetching route."""

from typing import Any

from fastapi import APIRouter, Depends

from dashboard_backend.src.db.repository import Repository, get_repo
from dashboard_backend.src.models.user import User
from dashboard_backend.src.services.auth import current_user
from dashboard_backend.src.services.page_data import (
    PageDataService,
    get_page_data_service,
)
from dashboard_backend.src.services.page_settings import resolve_page_settings
from dashboard_backend.src.util.exceptions import NotFoundException

router = APIRouter(tags=["page-data"])


@router.get("/{slug}")
async def read_page_data(
    slug: str,
    current: User | None = Depends(current_user),
    repo: Repository = Depends(get_repo),
    service: PageDataService = Depends(get_page_data_service),
) -> list[dict[str, Any]]:
    """Return page data for *slug*, if the page is published or the user is an
    admin.  Returns 404 when the page is not visible or no data getter exists."""
    if current is None or current.role != "admin":
        settings = await resolve_page_settings(slug, repo)
        if not settings.is_published:
            raise NotFoundException(f"Page not found: {slug}")

    return await service.get(slug)
