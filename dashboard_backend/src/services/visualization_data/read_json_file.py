"""Shared JSON file reader for visualization data."""

import json
from pathlib import Path
from typing import Any, cast

from dashboard_backend.src.util.exceptions import (
    ApplicationException,
    VisualizationDataNotFoundException,
)

type VisualizationDataset = dict[str, Any] | list[dict[str, Any]]
"""Union of possible visualization dataset types."""


class JSONFileReader:
    """Reads and parses a JSON file relative to a base data directory."""
    def __init__(self, relative_path: Path | str) -> None:
        if isinstance(relative_path, str):
            relative_path = Path(relative_path)
        self._relative_path = relative_path

    def read(self, base_dir: Path) -> VisualizationDataset:
        """Return parsed JSON from ``base_dir / self._relative_path``.

        Raises:
            VisualizationDataNotFoundException: file is missing.
            ApplicationException: file contains invalid JSON.
        """
        file_path = base_dir / self._relative_path
        try:
            raw = file_path.read_text(encoding="utf-8")
        except FileNotFoundError as e:
            raise VisualizationDataNotFoundException(
                f"Data file not found: {file_path}"
            ) from e
        try:
            return cast(VisualizationDataset, json.loads(raw))
        except json.JSONDecodeError as e:
            raise ApplicationException(
                f"Invalid JSON in data file: {file_path}"
            ) from e
