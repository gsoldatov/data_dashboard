"""Data getters for the Russia labor market visualization."""

import json
from pathlib import Path
from typing import Any, cast


def get_russia_salaries_average_data(data_dir: Path) -> list[dict[str, Any]]:
    file_path = data_dir / "russia_salaries_average" / "salaries.json"
    data = json.loads(file_path.read_text(encoding="utf-8"))
    return cast(list[dict[str, Any]], data)


def get_russia_salaries_by_sector_data(data_dir: Path) -> list[dict[str, Any]]:
    file_path = data_dir / "russia_salaries_by_sector" / "salaries.json"
    data = json.loads(file_path.read_text(encoding="utf-8"))
    return cast(list[dict[str, Any]], data)


def get_russia_labor_workforce_data(data_dir: Path) -> list[dict[str, Any]]:
    file_path = data_dir / "russia_labor_workforce" / "workforce.json"
    data = json.loads(file_path.read_text(encoding="utf-8"))
    return cast(list[dict[str, Any]], data)
