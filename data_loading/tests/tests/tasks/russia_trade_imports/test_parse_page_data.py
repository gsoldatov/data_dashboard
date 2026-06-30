"""
Test cases for Russia trade imports parsing logic
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
        PROJECT_ROOT / "data_loading/tests/mocks/mock_data/russia_trade_imports.html"
    )
    with open(mock_file_path, encoding="utf-8") as f:
        return f.read()


def test_region_exclusion(mock_html_content: str) -> None:
    """Test that regions are excluded from results."""
    by_country, _ = _parse(mock_html_content)
    countries = {entry["country"] for entry in by_country}
    assert "Europe & Central Asia" not in countries


def test_special_categories_included(mock_html_content: str) -> None:
    """Test that Special Categories and Unspecified are kept in results."""
    by_country, _ = _parse(mock_html_content)
    countries = {entry["country"] for entry in by_country}
    assert "Special Categories" in countries
    assert "Unspecified" in countries
    assert countries == {
        "United States", "China", "Special Categories", "Germany", "Unspecified"
    }


def test_value_conversion(mock_html_content: str) -> None:
    """Test that values are converted from thousands to raw USD."""
    by_country, _ = _parse(mock_html_content)

    china_1992 = [
        e for e in by_country if e["country"] == "China" and e["year"] == 1992
    ]
    assert len(china_1992) == 1
    assert china_1992[0]["value"] == 2_500_000.0
    assert isinstance(china_1992[0]["value"], float)


def test_empty_values_skipped(mock_html_content: str) -> None:
    """Test that empty string values are excluded from output."""
    by_country, _ = _parse(mock_html_content)

    us_entries = [e for e in by_country if e["country"] == "United States"]
    us_years = {e["year"] for e in us_entries}
    assert us_years == {1992, 1993}
    assert 1994 not in us_years


def test_yearly_totals(mock_html_content: str) -> None:
    """Test that yearly totals include Special Categories and Unspecified."""
    _, totals = _parse(mock_html_content)

    # 1992: US(3000.5) + China(2500.0) + Special(9999.9)
    #       + Germany(1800.25) + Unspecified(0.001) = 17300.651 thousand
    # 1993: US(3100.0) + Special(8888.8) + Germany(2000.0)
    #       + Unspecified(0.002) = 13988.802 thousand (China empty)
    # 1994: China(2700.75) + Special(7777.7) + Germany(1900.5)
    #       = 12378.95 thousand (US, Unspecified empty)

    totals_by_year = {t["year"]: t["value"] for t in totals}

    assert len(totals) == 3
    assert totals_by_year[1992] == 17_300_651.0
    assert totals_by_year[1993] == 13_988_802.0
    assert totals_by_year[1994] == 12_378_950.0


def test_output_structure(mock_html_content: str) -> None:
    """Test that output data has the expected structure and chronological order."""
    by_country, totals = _parse(mock_html_content)

    for entry in by_country:
        assert isinstance(entry["year"], int)
        assert isinstance(entry["country"], str)
        assert isinstance(entry["value"], float)
        assert set(entry.keys()) == {"year", "country", "value"}

    for entry in totals:
        assert isinstance(entry["year"], int)
        assert isinstance(entry["value"], float)
        assert set(entry.keys()) == {"year", "value"}

    years_bc = [e["year"] for e in by_country]
    assert years_bc == sorted(years_bc)

    years_t = [e["year"] for e in totals]
    assert years_t == sorted(years_t)


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
