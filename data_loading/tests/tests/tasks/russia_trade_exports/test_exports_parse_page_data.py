"""
Test cases for Russia trade exports parsing logic
"""
import sys
from pathlib import Path

import pytest

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_trade_imports.parse_page_data import _parse


@pytest.fixture(scope="module")
def mock_html_content() -> str:
    """Fixture that provides the mock HTML content for testing."""
    mock_file_path = (
        PROJECT_ROOT / "data_loading/tests/mocks/mock_data/russia_trade_exports.html"
    )
    with open(mock_file_path, encoding="utf-8") as f:
        return f.read()


def test_region_exclusion(mock_html_content: str) -> None:
    """Test that regions are excluded from results."""
    by_country, _ = _parse(mock_html_content)
    countries = {entry["country"] for entry in by_country}
    assert "Europe & Central Asia" not in countries


def test_special_categories_included(mock_html_content: str) -> None:
    """Test that Special Categories and Unspecified are kept."""
    by_country, _ = _parse(mock_html_content)
    countries = {entry["country"] for entry in by_country}
    assert "Special Categories" in countries
    assert "Unspecified" in countries
    assert countries == {
        "China", "Germany", "Special Categories", "United States", "Unspecified"
    }


def test_yearly_totals(mock_html_content: str) -> None:
    """Test that yearly totals include Special Categories and Unspecified."""
    _, totals = _parse(mock_html_content)

    # 1992: China(4500.0) + Germany(1800.25) + Special(7777.7)
    #       + US(3000.5) + Unspecified(0.001) = 17078.451 thousand
    # 1993: Germany(2000.0) + Special(6666.6) + US(3100.0)
    #       + Unspecified(0.002) = 11766.602 thousand (China empty)
    # 1994: China(4700.75) + Germany(1900.5) + Special(5555.5)
    #       = 12156.75 thousand (US, Unspecified empty)

    totals_by_year = {t["year"]: t["value"] for t in totals}
    assert len(totals) == 3
    assert totals_by_year[1992] == 17_078_451.0
    assert totals_by_year[1993] == 11_766_602.0
    assert totals_by_year[1994] == 12_156_750.0


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
