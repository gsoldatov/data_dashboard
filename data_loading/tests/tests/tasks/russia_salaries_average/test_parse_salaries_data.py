"""
Test cases for Russia average salaries parsing logic
"""
import sys
from pathlib import Path

import pandas
import pytest

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_salaries_average.parse_data import (
    _clean_value,
    _parse,
)


@pytest.fixture(scope="module")
def mock_df() -> pandas.DataFrame:
    """Fixture that provides the mock salaries xlsx as a DataFrame."""
    mock_file_path = (
        PROJECT_ROOT
        / "data_loading/tests/mocks/mock_data/russia_salaries_average.xlsx"
    )
    return pandas.read_excel(
        mock_file_path,
        sheet_name="Лист1",
        header=None,
        skiprows=7,
        usecols="A:B",
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
    """Test that year footnotes like '2002)' are cleaned to plain integers."""
    result = _parse(mock_df)
    years = {entry["year"] for entry in result}
    # Years with footnotes like '2002)', '2003)', '2006)' should become 2002, 2003, 2006
    assert 2002 in years
    assert 2003 in years
    assert 2006 in years
    # No string years should appear
    for entry in result:
        assert isinstance(entry["year"], int)


def test_all_years_present(mock_df: pandas.DataFrame) -> None:
    """Test that all expected years are extracted."""
    result = _parse(mock_df)
    years = sorted(entry["year"] for entry in result)
    expected_years = list(range(2000, 2007))
    assert years == expected_years


def test_correct_values(mock_df: pandas.DataFrame) -> None:
    """Test that salary values are correctly parsed."""
    result = _parse(mock_df)

    entry_2000 = next(e for e in result if e["year"] == 2000)
    assert entry_2000["value"] == 1523.0

    entry_2004 = next(e for e in result if e["year"] == 2004)
    assert entry_2004["value"] == 5500.0

    # Footnote years should still have correct values
    entry_2002 = next(e for e in result if e["year"] == 2002)
    assert entry_2002["value"] == 3058.0

    # Values with spaces and footnotes should be cleaned
    entry_2003 = next(e for e in result if e["year"] == 2003)
    assert entry_2003["value"] == 4500.0  # '4 500(1)' -> 4500.0

    entry_2006 = next(e for e in result if e["year"] == 2006)
    assert entry_2006["value"] == 9500.0  # '9 500(2)' -> 9500.0


def test_stops_on_non_year_text(mock_df: pandas.DataFrame) -> None:
    """Test that parsing stops when column A contains text
    that is not a year (e.g. '… данных не имеется')."""
    result = _parse(mock_df)
    assert len(result) == 7  # years 2000-2006, stops before footer text


def test_extra_columns_ignored(mock_df: pandas.DataFrame) -> None:
    """Test that only columns A and B are used (quarterly/monthly columns
    to the right are ignored via usecols='A:B')."""
    result = _parse(mock_df)
    # If extra columns leaked in, we'd have extra entries or wrong values
    assert len(result) == 7


def test_clean_value_removes_spaces() -> None:
    """Test that _clean_value removes spaces from numeric strings."""
    assert _clean_value("65 338") == 65338.0
    assert _clean_value("1 000 000") == 1000000.0


def test_clean_value_removes_footnotes() -> None:
    """Test that _clean_value removes footnote suffixes like (1), (2)."""
    assert _clean_value("65338(2)") == 65338.0
    assert _clean_value("4500(1)") == 4500.0


def test_clean_value_handles_spaces_and_footnotes() -> None:
    """Test that _clean_value handles both spaces and footnotes together."""
    assert _clean_value("65 338(2)") == 65338.0
    assert _clean_value("4 500(1)") == 4500.0


def test_clean_value_preserves_plain_numbers() -> None:
    """Test that _clean_value leaves clean numeric strings unchanged."""
    assert _clean_value(1523.0) == 1523.0
    assert _clean_value("1523") == 1523.0


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
