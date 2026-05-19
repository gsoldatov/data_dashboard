"""Page data service — dispatches data getters for each page slug."""

import asyncio
from collections.abc import Callable
from pathlib import Path
from typing import Any

from fastapi import Request

from dashboard_backend.src.services.page_data.russia_state_budget import get_data
from dashboard_backend.src.util.exceptions import NotFoundException

# Each key maps a page slug to a list of sync data-getter callables.
# Each getter receives the data directory and returns a dict.
_REGISTRY: dict[str, list[Callable[[Path], dict[str, Any]]]] = {
    "russia_state_budget": [get_data],
}


class PageDataService:
    """Dispatches data retrieval for a given page slug."""

    def __init__(self, data_directory: Path) -> None:
        self._data_directory = data_directory
        self._registry = _REGISTRY

    async def get(self, slug: str) -> list[dict[str, Any]]:
        """Run all registered getters for *slug* in a thread, returning their
        dict results as a list.  Raises ``NotFoundException`` when no getter
        is registered for the slug."""
        getters = self._registry.get(slug)
        if not getters:
            raise NotFoundException(f"No data getter for slug: {slug}")

        def _call_all() -> list[dict[str, Any]]:
            return [g(self._data_directory) for g in getters]

        return await asyncio.to_thread(_call_all)


def get_page_data_service(request: Request) -> PageDataService:
    """FastAPI dependency: build a ``PageDataService`` from the app config."""
    return PageDataService(request.app.state.config.data_directory)
