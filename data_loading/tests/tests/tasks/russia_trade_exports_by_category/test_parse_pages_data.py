"""
Test cases for Russia trade exports by category parsing logic
"""
import sys
from pathlib import Path

import pytest

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_trade_imports_by_category.parse_pages_data import (
    _parse_product_page,
    _product_code_to_name,
)


@pytest.fixture(scope="module")
def mock_wood_html() -> str:
    """Fixture that provides mock Wood product page HTML."""
    mock_file_path = (
        PROJECT_ROOT
        / "data_loading/tests/mocks/mock_data/russia_trade_exports_by_category"
        / "44-49_Wood.html"
    )
    with open(mock_file_path, encoding="utf-8") as f:
        return f.read()


@pytest.fixture(scope="module")
def mock_fuels_html() -> str:
    """Fixture that provides mock Fuels product page HTML."""
    mock_file_path = (
        PROJECT_ROOT
        / "data_loading/tests/mocks/mock_data/russia_trade_exports_by_category"
        / "27-27_Fuels.html"
    )
    with open(mock_file_path, encoding="utf-8") as f:
        return f.read()


def test_product_code_to_name() -> None:
    """Test product code to readable name conversion."""
    assert _product_code_to_name("44-49_Wood") == "Wood"
    assert _product_code_to_name("27-27_Fuels") == "Fuels"
    assert _product_code_to_name("16-24_FoodProd") == "Food Products"
    assert _product_code_to_name("39-40_PlastiRub") == "Plastic or Rubber"
    assert _product_code_to_name("84-85_MachElec") == "Machines and Electronics"
    assert _product_code_to_name("86-89_Transport") == "Transportation"
    # Fallback for unknown code
    assert _product_code_to_name("99-99_Unknown") == "Unknown"


def test_wood_empty_years_skipped(mock_wood_html: str) -> None:
    """Test that years with empty values are excluded from output."""
    entries = _parse_product_page(mock_wood_html, "Wood")
    years = {e["year"] for e in entries}
    assert 1992 not in years
    assert 1995 not in years
    assert years == {1996, 1997, 1998, 1999}


def test_wood_value_conversion(mock_wood_html: str) -> None:
    """Test that values are converted from thousands to raw USD."""
    entries = _parse_product_page(mock_wood_html, "Wood")
    entries_by_year = {e["year"]: e["value"] for e in entries}

    assert entries_by_year[1996] == 3_491_905_486.0
    assert entries_by_year[1997] == 3_509_710_519.0
    assert entries_by_year[1998] == 3_405_784_408.0
    assert entries_by_year[1999] == 3_594_303_823.0


def test_fuels_starts_later(mock_fuels_html: str) -> None:
    """Test that Fuels only has data from 2000 onward."""
    entries = _parse_product_page(mock_fuels_html, "Fuels")
    years = {e["year"] for e in entries}
    assert years == {2000, 2001}


def test_fuels_value_conversion(mock_fuels_html: str) -> None:
    """Test Fuels value conversion from thousands to raw USD."""
    entries = _parse_product_page(mock_fuels_html, "Fuels")
    entries_by_year = {e["year"]: e["value"] for e in entries}

    assert entries_by_year[2000] == 51_860_984_947.0
    assert entries_by_year[2001] == 56_120_644_815.0


def test_output_structure(mock_wood_html: str) -> None:
    """Test that output entries have the expected structure."""
    entries = _parse_product_page(mock_wood_html, "Wood")

    for entry in entries:
        assert isinstance(entry["year"], int)
        assert isinstance(entry["product_category"], str)
        assert isinstance(entry["value"], float)
        assert set(entry.keys()) == {"year", "product_category", "value"}

    assert entry["product_category"] == "Wood"


def test_output_sorted(mock_wood_html: str) -> None:
    """Test that entries are sorted by year."""
    entries = _parse_product_page(mock_wood_html, "Wood")
    years = [e["year"] for e in entries]
    assert years == sorted(years)


def test_combined_products(mock_wood_html: str, mock_fuels_html: str) -> None:
    """Test combined results from multiple product pages."""
    wood_entries = _parse_product_page(mock_wood_html, "Wood")
    fuels_entries = _parse_product_page(mock_fuels_html, "Fuels")

    all_entries = wood_entries + fuels_entries
    categories = {e["product_category"] for e in all_entries}
    assert categories == {"Wood", "Fuels"}

    total_years = len({(e["year"], e["product_category"]) for e in all_entries})
    assert total_years == 6  # 4 Wood years + 2 Fuels years


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
