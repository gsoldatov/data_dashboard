"""
Test cases for Russia trade imports by category parsing logic
"""
import sys
from pathlib import Path

import pytest

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.helpers.parsing.worldbank_wits_russia_trade import (
    parse_product_page,
    product_code_to_name,
)


@pytest.fixture(scope="module")
def mock_chemicals_html() -> str:
    """Fixture that provides mock Chemicals product page HTML."""
    mock_file_path = (
        PROJECT_ROOT
        / "data_loading/tests/mocks/mock_data/russia_trade_imports_by_category"
        / "28-38_Chemicals.html"
    )
    with open(mock_file_path, encoding="utf-8") as f:
        return f.read()


@pytest.fixture(scope="module")
def mock_machelec_html() -> str:
    """Fixture that provides mock MachElec product page HTML."""
    mock_file_path = (
        PROJECT_ROOT
        / "data_loading/tests/mocks/mock_data/russia_trade_imports_by_category"
        / "84-85_MachElec.html"
    )
    with open(mock_file_path, encoding="utf-8") as f:
        return f.read()


def test_product_code_to_name() -> None:
    """Test product code to readable name conversion."""
    assert product_code_to_name("28-38_Chemicals") == "Chemicals"
    assert product_code_to_name("84-85_MachElec") == "Machines and Electronics"
    assert product_code_to_name("16-24_FoodProd") == "Food Products"


def test_chemicals_empty_years_skipped(mock_chemicals_html: str) -> None:
    """Test that years with empty values are excluded from output."""
    entries = parse_product_page(mock_chemicals_html, "Chemicals")
    years = {e["year"] for e in entries}
    assert 1996 not in years
    assert 1997 not in years
    assert 2000 not in years
    assert years == {1998, 1999}


def test_chemicals_value_conversion(mock_chemicals_html: str) -> None:
    """Test that values are converted from thousands to raw USD."""
    entries = parse_product_page(mock_chemicals_html, "Chemicals")
    entries_by_year = {e["year"]: e["value"] for e in entries}

    assert entries_by_year[1998] == 2_100_500_500.0
    assert entries_by_year[1999] == 3_200_700_250.0


def test_machelec_all_years_present(mock_machelec_html: str) -> None:
    """Test that MachElec has data for consecutive years."""
    entries = parse_product_page(mock_machelec_html, "Machines and Electronics")
    years = {e["year"] for e in entries}
    assert years == {1998, 1999, 2000}


def test_machelec_value_conversion(mock_machelec_html: str) -> None:
    """Test MachElec value conversion from thousands to raw USD."""
    entries = parse_product_page(
        mock_machelec_html, "Machines and Electronics"
    )
    entries_by_year = {e["year"]: e["value"] for e in entries}

    assert entries_by_year[1998] == 5_100_000_000.0
    assert entries_by_year[1999] == 6_200_000_000.0
    assert entries_by_year[2000] == 7_300_000_500.0


def test_output_structure(mock_chemicals_html: str) -> None:
    """Test that output entries have the expected structure."""
    entries = parse_product_page(mock_chemicals_html, "Chemicals")

    for entry in entries:
        assert isinstance(entry["year"], int)
        assert isinstance(entry["product_category"], str)
        assert isinstance(entry["value"], float)
        assert set(entry.keys()) == {"year", "product_category", "value"}


def test_combined_products(
    mock_chemicals_html: str, mock_machelec_html: str
) -> None:
    """Test combined results from multiple product pages."""
    chem = parse_product_page(mock_chemicals_html, "Chemicals")
    mach = parse_product_page(
        mock_machelec_html, "Machines and Electronics"
    )

    all_entries = chem + mach
    categories = {e["product_category"] for e in all_entries}
    assert categories == {"Chemicals", "Machines and Electronics"}

    total = len({(e["year"], e["product_category"]) for e in all_entries})
    assert total == 5  # 2 Chemicals + 3 MachElec


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
