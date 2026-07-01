"""Test cases for JSONFileReader.read()."""

import json
import sys
from pathlib import Path

import pytest

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from dashboard_backend.src.services.visualization_data.read_json_file import (
    JSONFileReader,
)
from dashboard_backend.src.util.exceptions import (
    ApplicationException,
    VisualizationDataNotFoundException,
)


def test_read_json_file_valid_json(tmp_path: Path) -> None:
    """Returns parsed JSON when the file exists and is valid."""
    data = [{"key": "value"}, {"other": 42}]
    file_path = tmp_path / "data.json"
    file_path.write_text(json.dumps(data), encoding="utf-8")

    reader = JSONFileReader("data.json")
    result = reader.read(tmp_path)

    assert result == data


def test_read_json_file_missing_file(tmp_path: Path) -> None:
    """Raises VisualizationDataNotFoundException when the file does not exist."""
    reader = JSONFileReader("nonexistent.json")

    with pytest.raises(VisualizationDataNotFoundException) as exc_info:
        reader.read(tmp_path)
    assert "Data file not found" in str(exc_info.value)


def test_read_json_file_invalid_json(tmp_path: Path) -> None:
    """Raises ApplicationException when the file contains invalid JSON."""
    file_path = tmp_path / "broken.json"
    file_path.write_text("not json at all", encoding="utf-8")

    reader = JSONFileReader("broken.json")

    with pytest.raises(ApplicationException) as exc_info:
        reader.read(tmp_path)
    assert "Invalid JSON in data file" in str(exc_info.value)


def test_read_json_file_empty_file(tmp_path: Path) -> None:
    """Raises ApplicationException when the file is empty (not valid JSON)."""
    file_path = tmp_path / "empty.json"
    file_path.write_text("", encoding="utf-8")

    reader = JSONFileReader("empty.json")

    with pytest.raises(ApplicationException) as exc_info:
        reader.read(tmp_path)
    assert "Invalid JSON in data file" in str(exc_info.value)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
