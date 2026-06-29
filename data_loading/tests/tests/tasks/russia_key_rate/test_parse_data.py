"""
Test cases for Russia key rate parsing logic
"""
import sys
from pathlib import Path

import pandas
import pytest

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_key_rate.parse_data import _parse


@pytest.fixture(scope="module")
def mock_df() -> pandas.DataFrame:
    """Fixture that provides the mock key rate xlsx as a DataFrame."""
    mock_file_path = (
        PROJECT_ROOT
        / "data_loading/tests/mocks/mock_data/russia_key_rate.xlsx"
    )
    return pandas.read_excel(
        mock_file_path,
        sheet_name=0,
        header=0,
    )


def test_parse_returns_list_of_dicts(mock_df: pandas.DataFrame) -> None:
    """Test that _parse returns a list of dicts with expected keys."""
    result = _parse(mock_df)
    assert isinstance(result, list)
    assert len(result) > 0
    for entry in result:
        assert isinstance(entry, dict)
        assert "year_month" in entry
        assert isinstance(entry["year_month"], str)


def test_year_month_conversion(mock_df: pandas.DataFrame) -> None:
    """Test that mm.yyyy format is converted to yyyy-mm."""
    result = _parse(mock_df)
    year_months = {entry["year_month"] for entry in result}
    assert "2024-01" in year_months
    assert "2024-02" in year_months
    assert "2024-03" in year_months


def test_empty_cell_skipping(mock_df: pandas.DataFrame) -> None:
    """Test that rows with missing key_rate or inflation_yoy are still emitted."""
    result = _parse(mock_df)
    # 05.2024 has no inflation
    entry = next(e for e in result if e["year_month"] == "2024-05")
    assert "key_rate" in entry
    assert "inflation_yoy" not in entry
    # 06.2024 has no key_rate
    entry = next(e for e in result if e["year_month"] == "2024-06")
    assert "key_rate" not in entry
    assert "inflation_yoy" in entry


def test_correct_entry_count(mock_df: pandas.DataFrame) -> None:
    """Test that the correct number of entries is produced."""
    result = _parse(mock_df)
    assert len(result) == 7


def test_correct_values(mock_df: pandas.DataFrame) -> None:
    """Test that key rate and inflation values are correctly parsed."""
    result = _parse(mock_df)

    entry = next(e for e in result if e["year_month"] == "2023-01")
    assert entry["key_rate"] == 7.5
    assert entry["inflation_yoy"] == 11.8

    entry = next(e for e in result if e["year_month"] == "2024-01")
    assert entry["key_rate"] == 16.0
    assert entry["inflation_yoy"] == 7.4


def test_chronological_order(mock_df: pandas.DataFrame) -> None:
    """Test that entries are sorted chronologically by year_month."""
    result = _parse(mock_df)
    for i in range(1, len(result)):
        assert result[i]["year_month"] >= result[i - 1]["year_month"], (
            f"Out of order: {result[i-1]['year_month']}"
            f" > {result[i]['year_month']}"
        )


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
