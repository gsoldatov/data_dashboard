"""
Test cases for Russia labor workforce parsing logic
"""
import sys
from pathlib import Path

import pandas
import pytest

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_labor_workforce.parse_data import _parse


@pytest.fixture(scope="module")
def mock_df() -> pandas.DataFrame:
    """Fixture that provides the mock workforce xlsx as a DataFrame."""
    mock_file_path = (
        PROJECT_ROOT
        / "data_loading/tests/mocks/mock_data/russia_labor_workforce.xlsx"
    )
    return pandas.read_excel(
        mock_file_path,
        sheet_name="5",
        header=None,
        skiprows=6,
    )


def test_parse_returns_list_of_dicts(mock_df: pandas.DataFrame) -> None:
    """Test that _parse returns a list of dicts with expected keys."""
    result = _parse(mock_df)
    assert isinstance(result, list)
    assert len(result) > 0
    for entry in result:
        assert isinstance(entry, dict)
        assert "year_month" in entry
        assert "workforce" in entry
        assert "employed" in entry
        assert "unemployed" in entry
        assert "workforce_share_in_population" in entry
        assert "employed_share_in_population" in entry
        assert "unemployed_share_in_workforce" in entry
        assert isinstance(entry["year_month"], str)


def test_month_footnote_cleaning(mock_df: pandas.DataFrame) -> None:
    """Test that month footnote suffixes are stripped from month names."""
    result = _parse(mock_df)
    year_months = {entry["year_month"] for entry in result}
    # 'январь1)' should become 2017-01, 'март1)2)' should become 2017-03
    assert "2017-01" in year_months
    assert "2017-02" in year_months
    assert "2017-03" in year_months
    assert "2018-01" in year_months


def test_year_rows_skipped(mock_df: pandas.DataFrame) -> None:
    """Test that year-only rows (4-digit, no data) are not emitted."""
    result = _parse(mock_df)
    # Year rows 2017 and 2018 should not produce entries
    # All entries should be year_month strings (year rows would lack these)
    for entry in result:
        assert "-" in entry["year_month"]


def test_non_matching_labels_skipped(mock_df: pandas.DataFrame) -> None:
    """Test that labels not in the month map are skipped."""
    result = _parse(mock_df)
    # 'в том числе:' is not a month, should be skipped
    assert len(result) == 5  # 3 from 2017 + 2 from 2018


def test_correct_values(mock_df: pandas.DataFrame) -> None:
    """Test that indicator values are correctly parsed."""
    result = _parse(mock_df)

    # 2017-01 (январь)
    entry = next(e for e in result if e["year_month"] == "2017-01")
    assert entry["workforce"] == 100.1
    assert entry["employed"] == 90.1
    assert entry["unemployed"] == 10.0
    assert entry["workforce_share_in_population"] == 62.0

    # 2018-02 (февраль)
    entry = next(e for e in result if e["year_month"] == "2018-02")
    assert entry["workforce"] == 201.2
    assert entry["unemployed_share_in_workforce"] == 4.0


def test_correct_entry_count(mock_df: pandas.DataFrame) -> None:
    """Test that the correct number of entries is produced."""
    result = _parse(mock_df)
    assert len(result) == 5  # 3 months in 2017 + 2 months in 2018


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
