"""
Test cases for Russia GDP constant prices parsing logic
"""
import sys
from pathlib import Path

import pandas
import pytest

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_gdp_constant_prices_rub.parse_data import _parse


@pytest.fixture(scope="module")
def mock_df() -> pandas.DataFrame:
    """Fixture that provides the mock GDP xlsx as a DataFrame."""
    mock_file_path = (
        PROJECT_ROOT
        / "data_loading/tests/mocks/mock_data/russia_gdp_constant_prices_rub.xlsx"
    )
    return pandas.read_excel(
        mock_file_path,
        sheet_name="6",
        header=None,
        skiprows=2,
        nrows=2,
        usecols="A:O",
    )


def test_parse_returns_list_of_dicts(mock_df: pandas.DataFrame) -> None:
    """Test that _parse returns a list of {year, value} dicts."""
    result = _parse(mock_df)
    assert isinstance(result, list)
    assert len(result) > 0
    for entry in result:
        assert isinstance(entry, dict)
        assert "year" in entry
        assert "value" in entry
        assert isinstance(entry["year"], int)
        assert isinstance(entry["value"], float)


def test_footnote_cleaning_in_years(mock_df: pandas.DataFrame) -> None:
    """Test that year footnotes are cleaned to plain integers."""
    result = _parse(mock_df)
    years = {entry["year"] for entry in result}
    # Years with footnotes like '20012)', '20032)' should become 2001, 2003
    assert 2001 in years
    assert 2003 in years
    assert 2006 in years
    # Verify the 4-digit regex doesn't accidentally grab footnote digits
    assert 20012 not in years
    assert 20032 not in years
    # No string years should appear
    for entry in result:
        assert isinstance(entry["year"], int)


def test_all_years_present(mock_df: pandas.DataFrame) -> None:
    """Test that all expected years are extracted."""
    result = _parse(mock_df)
    years = sorted(entry["year"] for entry in result)
    expected_years = list(range(1995, 2010))
    assert years == expected_years


def test_correct_values(mock_df: pandas.DataFrame) -> None:
    """Test that GDP values are correctly parsed."""
    result = _parse(mock_df)

    # Check specific year-value pairs
    entry_1995 = next(e for e in result if e["year"] == 1995)
    assert entry_1995["value"] == 100.0

    entry_2004 = next(e for e in result if e["year"] == 2004)
    assert entry_2004["value"] == 1000.0

    entry_2009 = next(e for e in result if e["year"] == 2009)
    assert entry_2009["value"] == 1500.0

    # Footnote years (e.g. '20012)', '20032)' → 2001, 2003)
    # should still have correct values
    entry_2001 = next(e for e in result if e["year"] == 2001)
    assert entry_2001["value"] == 700.0

    entry_2003 = next(e for e in result if e["year"] == 2003)
    assert entry_2003["value"] == 900.0


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
