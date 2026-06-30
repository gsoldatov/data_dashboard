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


def test_non_country_filtering(mock_html_content: str) -> None:
    """Test that Special Categories and Unspecified are excluded from results."""
    by_country, _ = _parse(mock_html_content)

    countries = {entry["country"] for entry in by_country}
    assert "Special Categories" not in countries
    assert "Unspecified" not in countries
    assert countries == {"United States", "China", "Germany"}


def test_value_conversion(mock_html_content: str) -> None:
    """Test that values are converted from thousands to raw USD."""
    by_country, _ = _parse(mock_html_content)

    # China 1992: 2500.0 thousand → 2_500_000.0 USD
    china_1992 = [
        e for e in by_country if e["country"] == "China" and e["year"] == 1992
    ]
    assert len(china_1992) == 1
    assert china_1992[0]["value"] == 2_500_000.0
    assert isinstance(china_1992[0]["value"], float)


def test_empty_values_skipped(mock_html_content: str) -> None:
    """Test that empty string values are excluded from output."""
    by_country, _ = _parse(mock_html_content)

    # United States: 1992=3000.5, 1993=3100.0, 1994="" (empty)
    us_entries = [e for e in by_country if e["country"] == "United States"]
    us_years = {e["year"] for e in us_entries}
    assert us_years == {1992, 1993}
    assert 1994 not in us_years

    # China: 1992=2500.0, 1993="" (empty), 1994=2700.75
    china_entries = [e for e in by_country if e["country"] == "China"]
    china_years = {e["year"] for e in china_entries}
    assert china_years == {1992, 1994}
    assert 1993 not in china_years


def test_yearly_totals(mock_html_content: str) -> None:
    """Test that yearly totals are correctly computed from country values."""
    _, totals = _parse(mock_html_content)

    # Expected totals (raw USD):
    # 1992: US(3000.5) + China(2500.0) + Germany(1800.25) = 7300.75 thousand
    #       = 7_300_750.0 USD
    # 1993: US(3100.0) + Germany(2000.0) = 5100.0 thousand = 5_100_000.0 USD
    #       (China has empty in 1993)
    # 1994: China(2700.75) + Germany(1900.5) = 4601.25 thousand = 4_601_250.0 USD
    #       (US has empty in 1994)

    totals_by_year = {t["year"]: t["value"] for t in totals}

    assert len(totals) == 3
    assert totals_by_year[1992] == 7_300_750.0
    assert totals_by_year[1993] == 5_100_000.0
    assert totals_by_year[1994] == 4_601_250.0


def test_output_structure(mock_html_content: str) -> None:
    """Test that output data has the expected structure and types."""
    by_country, totals = _parse(mock_html_content)

    # By-country entries
    for entry in by_country:
        assert isinstance(entry["year"], int)
        assert isinstance(entry["country"], str)
        assert isinstance(entry["value"], float)
        assert set(entry.keys()) == {"year", "country", "value"}

    # Yearly totals
    for entry in totals:
        assert isinstance(entry["year"], int)
        assert isinstance(entry["value"], float)
        assert set(entry.keys()) == {"year", "value"}

    # Verify chronological order
    years_bc = [e["year"] for e in by_country]
    assert years_bc == sorted(years_bc)

    years_t = [e["year"] for e in totals]
    assert years_t == sorted(years_t)


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
