"""Visualization data service — dispatches data getters for each slug."""

import asyncio
from collections.abc import Callable
from pathlib import Path

from fastapi import Request

from dashboard_backend.src.services.visualization_data.read_json_file import (
    JSONFileReader,
    VisualizationDataset,
)
from dashboard_backend.src.util.exceptions import NotFoundException

__all__ = [
    "VisualizationDataset",
    "VisualizationDataService",
    "get_visualization_data_service",
]

# Each key maps a visualization slug to a list of sync data-getter callables.
_REGISTRY: dict[str, list[Callable[[Path], VisualizationDataset]]] = {
    "russia_gdp": [
        JSONFileReader("russia_gdp_constant_prices_rub/gdp.json").read,
        JSONFileReader("russia_gdp_constant_prices_usd/gdp.json").read,
        JSONFileReader("russia_gdp_ppp_constant_prices/gdp.json").read,
    ],
    "russia_inflation": [
        JSONFileReader("russia_consumer_price_index/cpi.json").read,
        JSONFileReader("russia_key_rate/key_rate.json").read,
    ],
    "russia_state_budget": [
        JSONFileReader("russia_state_budget/budget.json").read,
    ],
    "russia_labor_market": [
        JSONFileReader("russia_salaries_average/salaries.json").read,
        JSONFileReader("russia_salaries_by_sector/salaries.json").read,
        JSONFileReader("russia_labor_workforce/workforce.json").read,
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
                results.append(g(self._data_directory))
            return results

        return await asyncio.to_thread(_call_all)


def get_visualization_data_service(
    request: Request,
) -> VisualizationDataService:
    """FastAPI dependency: build a ``VisualizationDataService`` from the app config."""
    return VisualizationDataService(
        request.app.state.config.visualization_data_directory
    )
