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


def test_non_country_filtering(mock_html_content: str) -> None:
    """Test that Special Categories and Unspecified are excluded."""
    by_country, _ = _parse(mock_html_content)
    countries = {entry["country"] for entry in by_country}
    assert "Special Categories" not in countries
    assert "Unspecified" not in countries
    assert countries == {"China", "Germany", "United States"}


def test_yearly_totals(mock_html_content: str) -> None:
    """Test that yearly totals match expected export values."""
    _, totals = _parse(mock_html_content)

    # 1992: China(4500.0) + Germany(1800.25) + US(3000.5) = 9300.75 thousand
    # 1993: Germany(2000.0) + US(3100.0) = 5100.0 thousand (China empty)
    # 1994: China(4700.75) + Germany(1900.5) = 6601.25 thousand (US empty)

    totals_by_year = {t["year"]: t["value"] for t in totals}
    assert totals_by_year[1992] == 9_300_750.0
    assert totals_by_year[1993] == 5_100_000.0
    assert totals_by_year[1994] == 6_601_250.0
    assert len(totals) == 3


def test_value_conversion(mock_html_content: str) -> None:
    """Test that export values are converted from thousands to raw USD."""
    by_country, _ = _parse(mock_html_content)

    # China 1992: 4500.0 thousand → 4_500_000.0 USD
    china_1992 = [
        e for e in by_country if e["country"] == "China" and e["year"] == 1992
    ]
    assert len(china_1992) == 1
    assert china_1992[0]["value"] == 4_500_000.0
    assert isinstance(china_1992[0]["value"], float)


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
