"""
Test cases for World Bank PPP GDP parsing logic
"""
import sys
from pathlib import Path

import pandas
import pytest

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_gdp_ppp_constant_prices.parse_data import (
    _parse,
)


@pytest.fixture(scope="module")
def mock_df() -> pandas.DataFrame:
    """Fixture that provides the mock World Bank PPP GDP CSV as a DataFrame."""
    mock_file_path = (
        PROJECT_ROOT
        / "data_loading/tests/mocks/mock_data"
        / "russia_gdp_ppp_constant_prices.csv"
    )
    return pandas.read_csv(mock_file_path, skiprows=4)


def test_parse_filters_by_rus_country_code(mock_df: pandas.DataFrame) -> None:
    """Only RUS rows should be included; USA should be excluded."""
    result = _parse(mock_df)
    assert len(result) == 3


def test_extracts_only_non_empty_values(mock_df: pandas.DataFrame) -> None:
    """Empty year values (like 2002 for RUS) should be skipped."""
    result = _parse(mock_df)
    years = {entry["year"] for entry in result}
    assert 2000 in years
    assert 2001 in years
    assert 2003 in years
    assert 2002 not in years
    assert 2004 not in years


def test_year_and_value_types(mock_df: pandas.DataFrame) -> None:
    """Year should be int, value should be float."""
    result = _parse(mock_df)
    for entry in result:
        assert isinstance(entry["year"], int)
        assert isinstance(entry["value"], float)


def test_correct_values(mock_df: pandas.DataFrame) -> None:
    """Values should match the mock data for RUS."""
    result = _parse(mock_df)

    entry_2000 = next(e for e in result if e["year"] == 2000)
    assert entry_2000["value"] == 1234.5

    entry_2001 = next(e for e in result if e["year"] == 2001)
    assert entry_2001["value"] == 5678.9

    entry_2003 = next(e for e in result if e["year"] == 2003)
    assert entry_2003["value"] == 9999.0


def test_missing_country_code_column() -> None:
    """Should raise ValueError if 'Country Code' column is missing."""
    df = pandas.DataFrame({"Some Other Column": ["RUS"], "2000": [1.0]})
    with pytest.raises(ValueError, match="Country Code"):
        _parse(df)


def test_no_rus_row_found() -> None:
    """Should raise ValueError if no RUS row exists."""
    df = pandas.DataFrame({
        "Country Name": ["USA"],
        "Country Code": ["USA"],
        "Indicator Name": [""],
        "Indicator Code": [""],
        "2000": [1.0],
    })
    with pytest.raises(ValueError, match="RUS"):
        _parse(df)


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
