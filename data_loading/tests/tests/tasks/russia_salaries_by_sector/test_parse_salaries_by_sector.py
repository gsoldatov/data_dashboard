"""
Test cases for Russia salaries by sector parsing logic
"""
import sys
from pathlib import Path
from typing import Any

import pandas
import pytest

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_salaries_by_sector.parse_data import _parse


@pytest.fixture(scope="module")
def mock_df() -> pandas.DataFrame:
    """Fixture that provides the mock salaries-by-sector xlsx as a DataFrame."""
    mock_file_path = (
        PROJECT_ROOT
        / "data_loading/tests/mocks/mock_data/russia_salaries_by_sector.xlsx"
    )
    df = pandas.read_excel(
        mock_file_path,
        sheet_name="с 2017 г.",
        header=4,
    )
    return df


@pytest.fixture(scope="module")
def mock_year_columns(mock_df: pandas.DataFrame) -> list[Any]:
    """Year column headers from the mock xlsx."""
    return list(mock_df.columns[1:])


def test_parse_returns_list_of_dicts(
    mock_df: pandas.DataFrame, mock_year_columns: list[Any]
) -> None:
    """Test that _parse returns a list of {year, sector, value} dicts."""
    result = _parse(mock_df, mock_year_columns)
    assert isinstance(result, list)
    assert len(result) > 0
    for entry in result:
        assert isinstance(entry, dict)
        assert "year" in entry
        assert "sector" in entry
        assert "value" in entry
        assert isinstance(entry["year"], int)
        assert isinstance(entry["sector"], str)
        assert isinstance(entry["value"], float)


def test_filters_by_target_sectors(
    mock_df: pandas.DataFrame, mock_year_columns: list[Any]
) -> None:
    """Test that only sectors in _TARGET_SECTORS are included."""
    result = _parse(mock_df, mock_year_columns)
    sectors = {entry["sector"] for entry in result}
    assert sectors == {
        "сельское, лесное хозяйство, охота, рыболовство и рыбоводство",
        "добыча полезных ископаемых",
    }
    # Non-matching rows (sub-sector and header text) should be absent
    assert "растениеводство и животноводство" not in sectors
    assert "из нее:" not in sectors


def test_year_footnote_cleaning(
    mock_df: pandas.DataFrame, mock_year_columns: list[Any]
) -> None:
    """Test that year column headers with footnotes are cleaned."""
    result = _parse(mock_df, mock_year_columns)
    years = {entry["year"] for entry in result}
    assert years == {2017, 2018, 2022}


def test_value_footnote_cleaning(
    mock_df: pandas.DataFrame, mock_year_columns: list[Any]
) -> None:
    """Test that values with spaces and footnotes are cleaned."""
    result = _parse(mock_df, mock_year_columns)
    # Find the entry for сельское хозяйство, 2022 — value is '46 777(2)'
    entry = next(
        e
        for e in result
        if e["sector"] == "сельское, лесное хозяйство, охота, рыболовство и рыбоводство"
        and e["year"] == 2022
    )
    assert entry["value"] == 46777.0


def test_correct_values(
    mock_df: pandas.DataFrame, mock_year_columns: list[Any]
) -> None:
    """Test that values are correctly parsed."""
    result = _parse(mock_df, mock_year_columns)

    # сельское хозяйство, 2017
    entry = next(
        e
        for e in result
        if e["sector"] == "сельское, лесное хозяйство, охота, рыболовство и рыбоводство"
        and e["year"] == 2017
    )
    assert entry["value"] == 25671.1

    # добыча, 2018
    entry = next(
        e
        for e in result
        if e["sector"] == "добыча полезных ископаемых"
        and e["year"] == 2018
    )
    assert entry["value"] == 83178.0


def test_correct_entry_count(
    mock_df: pandas.DataFrame, mock_year_columns: list[Any]
) -> None:
    """Test that the correct number of entries is produced.
    2 matching sectors × 3 years = 6 entries."""
    result = _parse(mock_df, mock_year_columns)
    assert len(result) == 6


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
