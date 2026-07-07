"""Visualization data service — dispatches data getters for each slug."""

import asyncio
from collections.abc import Callable
from pathlib import Path

from fastapi import Request

from dashboard_backend.src.services.visualization_data.read_json_file import (
    VisualizationDataset,
)
from dashboard_backend.src.services.visualization_data.registry import (
    DATASET_REGISTRY,
)
from dashboard_backend.src.util.exceptions import NotFoundException

__all__ = [
    "VisualizationDataset",
    "VisualizationDataService",
    "get_visualization_data_service",
]


class VisualizationDataService:
    """Dispatches data retrieval for a list of dataset names."""

    def __init__(self, data_directory: Path) -> None:
        self._data_directory = data_directory
        self._registry = DATASET_REGISTRY

    def get_consumer_slugs(self, dataset_names: list[str]) -> set[str]:
        """Return the union of consumer slugs for the given dataset names."""
        slugs: set[str] = set()
        for name in dataset_names:
            entry = self._registry.get(name)
            if entry is not None:
                consumers: list[str] = entry["consumers"]  # type: ignore[assignment]
                slugs.update(consumers)
        return slugs

    def validate_names(self, dataset_names: list[str]) -> None:
        """Raise ``NotFoundException`` when any name in *dataset_names*
        is not registered."""
        unknown = [n for n in dataset_names if n not in self._registry]
        if unknown:
            raise NotFoundException(
                f"Unknown dataset(s): {', '.join(sorted(unknown))}"
            )

    async def get_many(
        self, dataset_names: list[str]
    ) -> dict[str, VisualizationDataset]:
        """Run the getter for every dataset in *dataset_names*, returning a
        ``{name: data}`` mapping.  Raises ``NotFoundException`` when any
        dataset name is unknown."""
        unknown = [n for n in dataset_names if n not in self._registry]
        if unknown:
            raise NotFoundException(
                f"Unknown dataset(s): {', '.join(sorted(unknown))}"
            )

        def _call_all() -> dict[str, VisualizationDataset]:
            results: dict[str, VisualizationDataset] = {}
            for name in dataset_names:
                getter: Callable[[Path], VisualizationDataset] = self._registry[name][
                    "getter"
                ]  # type: ignore[assignment]
                results[name] = getter(self._data_directory)
            return results

        return await asyncio.to_thread(_call_all)


def get_visualization_data_service(
    request: Request,
) -> VisualizationDataService:
    """FastAPI dependency: build a ``VisualizationDataService`` from the app config."""
    return VisualizationDataService(
        request.app.state.config.visualization_data_directory
    )
