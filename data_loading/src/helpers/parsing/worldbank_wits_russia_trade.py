"""
Shared parsing utilities for WITS World Bank Russia trade data.

Supports two page formats:
  - by-country pages (``parse_by_country_page``)
  - by-category product pages (``parse_product_page``)
"""

from __future__ import annotations

import json
import re
from typing import Any

# -- by-country page parsing ------------------------------------------------

# WITS region/aggregate entries to exclude.
# These are only present in the ALL view, but the blocklist serves as a safety
# net in case the data source changes.
_EXCLUDED_REGIONS: frozenset[str] = frozenset({
    "World",
    "East Asia & Pacific",
    "Europe & Central Asia",
    "Latin America & Caribbean",
    "Middle East, North Africa, Afghanistan & Pakistan",
    "North America",
    "South Asia",
    "Sub-Saharan Africa",
})

_RE_PARTNER_NAMES = re.compile(r"RPartnerName\s*=\s*(\[.*?\]);", re.DOTALL)
_RE_YEAR_DATA = re.compile(r"R(\d{4})\s*=\s*(\[.*?\]);", re.DOTALL)

# -- by-category product page parsing ---------------------------------------

_RE_COL_DATA = re.compile(r"var col(\d+)\s*=\s*\[\"([^\"]*)\"\]")
_RE_YEAR_MAP = re.compile(r"text:'(\d{4})',\s*datafield:'col(\d+)'")

# -- shared constants -------------------------------------------------------

_THOUSANDS_TO_USD = 1000

_PRODUCT_NAME_MAP: dict[str, str] = {
    "01-05_Animal": "Animal",
    "06-15_Vegetable": "Vegetable",
    "16-24_FoodProd": "Food Products",
    "25-26_Minerals": "Minerals",
    "27-27_Fuels": "Fuels",
    "28-38_Chemicals": "Chemicals",
    "39-40_PlastiRub": "Plastic or Rubber",
    "41-43_HidesSkin": "Hides and Skins",
    "44-49_Wood": "Wood",
    "50-63_TextCloth": "Textiles and Clothing",
    "64-67_Footwear": "Footwear",
    "68-71_StoneGlas": "Stone and Glass",
    "72-83_Metals": "Metals",
    "84-85_MachElec": "Machines and Electronics",
    "86-89_Transport": "Transportation",
    "90-99_Miscellan": "Miscellaneous",
}


# -- by-country page parsing ------------------------------------------------


def parse_by_country_page(
    html_content: str,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """
    Parses an HTML document with embedded JS arrays (RPartnerName, R{YYYY})
    from a WITS by-country trade page.

    Returns (by_country_list, yearly_totals_list).
    """
    names_match = _RE_PARTNER_NAMES.search(html_content)
    if names_match is None:
        raise ValueError(
            "HTML does not contain RPartnerName array"
        )
    partner_names = json.loads(names_match.group(1))

    year_matches = _RE_YEAR_DATA.findall(html_content)
    if not year_matches:
        raise ValueError("HTML does not contain yearly data arrays")

    years_data: dict[int, list[str]] = {}
    for year_str, array_str in year_matches:
        years_data[int(year_str)] = json.loads(array_str)

    for year, values in years_data.items():
        if len(values) != len(partner_names):
            raise ValueError(
                f"Year {year} has {len(values)} entries, "
                f"but {len(partner_names)} partner names"
            )

    by_country: list[dict[str, Any]] = []
    yearly_sums: dict[int, float] = {}

    for idx, name in enumerate(partner_names):
        if name in _EXCLUDED_REGIONS:
            continue

        for year, values in sorted(years_data.items()):
            raw_value = values[idx]
            if not raw_value:
                continue

            value = float(raw_value) * _THOUSANDS_TO_USD
            by_country.append({
                "year": year,
                "country": name,
                "value": value,
            })
            yearly_sums[year] = yearly_sums.get(year, 0.0) + value

    by_country.sort(key=lambda e: (e["year"], e["country"]))

    totals: list[dict[str, Any]] = [
        {"year": year, "value": round(value, 2)}
        for year, value in sorted(yearly_sums.items())
    ]

    return by_country, totals


# -- by-category product page parsing ---------------------------------------


def parse_product_page(
    html_content: str, product_category: str
) -> list[dict[str, Any]]:
    """
    Parses a product-category HTML page and returns a list of
    {year, product_category, value} entries.
    """
    col_data: dict[int, str] = {}
    for match in _RE_COL_DATA.finditer(html_content):
        col_num = int(match.group(1))
        value = match.group(2)
        col_data[col_num] = value

    year_map: dict[int, int] = {}
    for match in _RE_YEAR_MAP.finditer(html_content):
        year = int(match.group(1))
        col_num = int(match.group(2))
        year_map[col_num] = year

    if not col_data:
        raise ValueError("No col data arrays found in product page HTML")
    if not year_map:
        raise ValueError("No year-to-column mapping found in product page HTML")

    entries: list[dict[str, Any]] = []
    for col_num, raw_value in col_data.items():
        if col_num == 0:
            continue
        if not raw_value:
            continue

        mapped_year = year_map.get(col_num)
        if mapped_year is None:
            continue

        value = float(raw_value) * _THOUSANDS_TO_USD
        entries.append({
            "year": mapped_year,
            "product_category": product_category,
            "value": value,
        })

    return entries


def product_code_to_name(product_code: str) -> str:
    """Map a product code like '44-49_Wood' to a human-readable name."""
    name = _PRODUCT_NAME_MAP.get(product_code)
    if name is not None:
        return name
    underscore_idx = product_code.rfind("_")
    if underscore_idx >= 0:
        return product_code[underscore_idx + 1:]
    return product_code
