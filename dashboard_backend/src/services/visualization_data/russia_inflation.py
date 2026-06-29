"""Data getters for the Russia inflation visualization."""

import json
from pathlib import Path
from typing import Any, cast


def get_russia_consumer_price_index_data(
    data_dir: Path,
) -> list[dict[str, Any]]:
    file_path = data_dir / "russia_consumer_price_index" / "cpi.json"
    data = json.loads(file_path.read_text(encoding="utf-8"))
    return cast(list[dict[str, Any]], data)


def get_russia_key_rate_data(data_dir: Path) -> list[dict[str, Any]]:
    file_path = data_dir / "russia_key_rate" / "key_rate.json"
    data = json.loads(file_path.read_text(encoding="utf-8"))
    return cast(list[dict[str, Any]], data)
