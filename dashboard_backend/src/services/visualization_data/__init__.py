"""Visualization data service — dispatches data getters for each slug."""

import asyncio
from collections.abc import Callable
from pathlib import Path
from typing import Any

from fastapi import Request

from dashboard_backend.src.services.visualization_data.russia_gdp import (
    get_russia_gdp_constant_prices_rub,
    get_russia_gdp_constant_prices_usd,
    get_russia_gdp_ppp_constant_prices,
)
from dashboard_backend.src.services.visualization_data.russia_labor_market import (
    get_russia_labor_workforce_data,
    get_russia_salaries_average_data,
    get_russia_salaries_by_sector_data,
)
from dashboard_backend.src.services.visualization_data.russia_state_budget import (
    get_russia_state_budget_data,
)
from dashboard_backend.src.util.exceptions import (
    NotFoundException,
    VisualizationDataNotFoundException,
)

type VisualizationDataset = dict[str, Any] | list[dict[str, Any]]
""" Union of possible visualization dataset types. """

# Each key maps a visualization slug to a list of sync data-getter callables.
_REGISTRY: dict[str, list[Callable[[Path], VisualizationDataset]]] = {
    "russia_gdp": [
        get_russia_gdp_constant_prices_rub,
        get_russia_gdp_constant_prices_usd,
        get_russia_gdp_ppp_constant_prices,
    ],
    "russia_state_budget": [get_russia_state_budget_data],
    "russia_labor_market": [
        get_russia_salaries_average_data,
        get_russia_salaries_by_sector_data,
        get_russia_labor_workforce_data,
    ],
}


class VisualizationDataService:
    """Dispatches data retrieval for a given visualization slug."""

    def __init__(self, data_directory: Path) -> None:
        self._data_directory = data_directory
        self._registry = _REGISTRY

    async def get(self, slug: str) -> list[VisualizationDataset]:
        """Run all registered getters for *slug* in a thread, returning their
        results as a list.  Each getter may return data
        in one of VisualizationDataset formats.
        Raises ``NotFoundException`` when no getter is registered for the slug."""
        getters = self._registry.get(slug)
        if not getters:
            raise NotFoundException(f"No data getter for slug: {slug}")

        def _call_all() -> list[VisualizationDataset]:
            results: list[VisualizationDataset] = []
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
