"""Data getters for the Russia GDP visualization."""

import json
from pathlib import Path
from typing import Any, cast


def get_russia_gdp_constant_prices_rub(data_dir: Path) -> list[dict[str, Any]]:
    file_path = data_dir / "russia_gdp_constant_prices_rub" / "gdp.json"
    data = json.loads(file_path.read_text(encoding="utf-8"))
    return cast(list[dict[str, Any]], data)


def get_russia_gdp_constant_prices_usd(data_dir: Path) -> list[dict[str, Any]]:
    file_path = data_dir / "russia_gdp_constant_prices_usd" / "gdp.json"
    data = json.loads(file_path.read_text(encoding="utf-8"))
    return cast(list[dict[str, Any]], data)


def get_russia_gdp_ppp_constant_prices(data_dir: Path) -> list[dict[str, Any]]:
    file_path = data_dir / "russia_gdp_ppp_constant_prices" / "gdp.json"
    data = json.loads(file_path.read_text(encoding="utf-8"))
    return cast(list[dict[str, Any]], data)
