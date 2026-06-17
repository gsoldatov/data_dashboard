"""Visualization data service — dispatches data getters for each slug."""

import asyncio
from collections.abc import Callable
from pathlib import Path
from typing import Any

from fastapi import Request

from dashboard_backend.src.services.visualization_data.russia_state_budget import (
    get_russia_state_budget_data,
)
from dashboard_backend.src.util.exceptions import (
    NotFoundException,
    VisualizationDataNotFoundException,
)

# Each key maps a visualization slug to a list of sync data-getter callables.
# Each getter receives the data directory and returns a dict.
_REGISTRY: dict[str, list[Callable[[Path], dict[str, Any]]]] = {
    "russia_state_budget": [get_russia_state_budget_data],
}


class VisualizationDataService:
    """Dispatches data retrieval for a given visualization slug."""

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
            results: list[dict[str, Any]] = []
            for g in getters:
                try:
                    results.append(g(self._data_directory))
                except FileNotFoundError as e:
                    raise VisualizationDataNotFoundException(
                        f"Data file not found for slug: {slug}"
                    ) from e
            return results

        return await asyncio.to_thread(_call_all)


def get_visualization_data_service(
    request: Request,
) -> VisualizationDataService:
    """FastAPI dependency: build a ``VisualizationDataService`` from the app config."""
    return VisualizationDataService(
        request.app.state.config.visualization_data_directory
    )
