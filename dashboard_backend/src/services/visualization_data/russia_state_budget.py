"""Data getter for the Russia state budget page."""

import json
from pathlib import Path
from typing import Any, cast


def get_russia_state_budget_data(data_dir: Path) -> dict[str, Any]:
    """Read and return the Russia state budget JSON data."""
    file_path = data_dir / "russia_state_budget" / "budget.json"
    data = json.loads(file_path.read_text(encoding="utf-8"))
    return cast(dict[str, Any], data)
