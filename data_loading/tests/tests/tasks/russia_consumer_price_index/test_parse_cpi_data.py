"""
Test cases for Russia consumer price index parsing logic
"""
import sys
from pathlib import Path

import pandas
import pytest

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_consumer_price_index.parse_data import (
    _parse,
)


@pytest.fixture(scope="module")
def mock_df() -> pandas.DataFrame:
    """Fixture that provides the mock CPI xlsx as a DataFrame."""
    mock_file_path = (
        PROJECT_ROOT
        / "data_loading/tests/mocks/mock_data/russia_consumer_price_index.xlsx"
    )
    return pandas.read_excel(
        mock_file_path,
        sheet_name="01",
        header=None,
        skiprows=3,
    )


def test_parse_returns_list_of_dicts(mock_df: pandas.DataFrame) -> None:
    """Test that _parse returns a list of dicts with expected keys."""
    result = _parse(mock_df)
    assert isinstance(result, list)
    assert len(result) > 0
    for entry in result:
        assert isinstance(entry, dict)
        assert "year_month" in entry
        assert "value" in entry
        assert isinstance(entry["year_month"], str)
        assert isinstance(entry["value"], float)


def test_month_footnote_cleaning(mock_df: pandas.DataFrame) -> None:
    """Test that month footnote suffixes are stripped from month names."""
    result = _parse(mock_df)
    year_months = {entry["year_month"] for entry in result}
    # 'февраль1)' should become 02
    assert "2024-02" in year_months


def test_future_months_skipped(mock_df: pandas.DataFrame) -> None:
    """Test that empty cells (future months) produce no entries."""
    result = _parse(mock_df)
    year_months = {entry["year_month"] for entry in result}
    # 2025-03 and beyond are empty, should not appear
    assert "2025-03" not in year_months
    assert "2025-04" not in year_months


def test_correct_entry_count(mock_df: pandas.DataFrame) -> None:
    """Test that the correct number of entries is produced."""
    result = _parse(mock_df)
    # 12 months for 2024 + 2 months (Jan, Feb) for 2025 = 14
    assert len(result) == 14


def test_correct_values(mock_df: pandas.DataFrame) -> None:
    """Test that CPI values are correctly parsed."""
    result = _parse(mock_df)

    entry = next(e for e in result if e["year_month"] == "2024-01")
    assert entry["value"] == 100.5

    entry = next(e for e in result if e["year_month"] == "2025-01")
    assert entry["value"] == 101.2

    entry = next(e for e in result if e["year_month"] == "2024-12")
    assert entry["value"] == 103.0

    entry = next(e for e in result if e["year_month"] == "2025-02")
    assert entry["value"] == 101.5


def test_chronological_order(mock_df: pandas.DataFrame) -> None:
    """Test that entries are sorted chronologically by year_month."""
    result = _parse(mock_df)
    for i in range(1, len(result)):
        assert result[i]["year_month"] >= result[i - 1]["year_month"], (
            f"Out of order: {result[i-1]['year_month']} > {result[i]['year_month']}"
        )


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
