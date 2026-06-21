"""
Test cases for Russia state budget parsing logic
"""
import sys
from pathlib import Path

import pytest

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.tasks.russia_state_budget.parse_page_data import _parse


@pytest.fixture(scope="module")
def mock_html_content() -> str:
    """Fixture that provides the mock HTML content for testing."""
    mock_file_path = (
        PROJECT_ROOT / "data_loading/tests/mocks/mock_data/russia_state_budget.html"
    )
    with open(mock_file_path, encoding="utf-8") as f:
        return f.read()


def test_years_extraction_and_cleaning(mock_html_content: str) -> None:
    """Test that years are correctly extracted and cleaned from table headers."""
    result = _parse(mock_html_content)
    years = sorted(set(entry["year"] for entry in result))
    assert years == [2020, 2021, 2022, 2023]


def test_filtering_visual_indentation_rows(mock_html_content: str) -> None:
    """Test that visual indentation rows (РАЗДЕЛ) are filtered out."""
    result = _parse(mock_html_content)

    # Check that no entry has a name starting with РАЗДЕЛ
    for entry in result:
        assert not entry["name"].startswith("РАЗДЕЛ"), \
            f"Found entry starting with РАЗДЕЛ: {entry['name']}"


def test_removing_trailing_asterisks_from_section_names(mock_html_content: str) -> None:
    """Test that trailing asterisks are removed from section names."""
    result = _parse(mock_html_content)

    # Section 2 should not have an asterisk in its name
    section_2_entries = [e for e in result if e["number"] == "2"]
    assert len(section_2_entries) > 0
    for entry in section_2_entries:
        assert entry["name"] == "Section 2"
        assert entry["name"] != "Section 2*"

    # Verify no entry names end with asterisk
    for entry in result:
        assert not entry["name"].endswith("*"), \
            f"Found entry name ending with asterisk: {entry['name']}"


def test_parsing_numbers_with_spaces(mock_html_content: str) -> None:
    """Test that numbers with spaces are correctly parsed."""
    result = _parse(mock_html_content)

    # Section 2 should have the value 1300.0 for 2020 (from "1&nbsp;300.0")
    section_2_2020 = [
        e for e in result if e["number"] == "2" and e["year"] == 2020
    ]
    assert len(section_2_2020) == 1
    assert section_2_2020[0]["value"] == 1300.0

    # Verify the value is a float, not a string
    assert isinstance(section_2_2020[0]["value"], float)


def test_hierarchical_structure_validation(mock_html_content: str) -> None:
    """Test that the flat structure contains all expected entries."""
    result = _parse(mock_html_content)

    def get_value(number: str, year: int) -> float | None:
        entries = [e for e in result if e["number"] == number and e["year"] == year]
        return entries[0]["value"] if entries else None

    # Check section 1 values
    assert get_value("1", 2020) == 1000.0
    assert get_value("1", 2021) == 1100.0
    assert get_value("1", 2022) == 1200.0
    assert get_value("1", 2023) == 1300.0

    # Check section 1.1 values
    assert get_value("1.1", 2020) == 400.0
    assert get_value("1.1", 2021) == 500.0
    assert get_value("1.1", 2022) == 600.0
    assert get_value("1.1", 2023) == 700.0

    # Check section 1.1.1 values
    assert get_value("1.1.1", 2020) == 100.0
    assert get_value("1.1.1", 2021) == 200.0
    assert get_value("1.1.1", 2022) == 300.0
    assert get_value("1.1.1", 2023) == 400.0

    # Check section 1.1.2 values
    assert get_value("1.1.2", 2020) == 300.0
    assert get_value("1.1.2", 2021) == 400.0
    assert get_value("1.1.2", 2022) == 500.0
    assert get_value("1.1.2", 2023) == 600.0

    # Check section 1.2 values
    assert get_value("1.2", 2020) == 600.0
    assert get_value("1.2", 2021) == 600.0
    assert get_value("1.2", 2022) == 600.0
    assert get_value("1.2", 2023) == 600.0


def test_multiline_section_handling(mock_html_content: str) -> None:
    """Test that multiline sections are properly handled."""
    result = _parse(mock_html_content)

    # Section 2.2 (first part) should have data for 2020 and 2021 only
    section_2_2 = [e for e in result if e["number"] == "2.2"]
    assert len(section_2_2) == 2
    years_2_2 = {e["year"] for e in section_2_2}
    assert years_2_2 == {2020, 2021}
    assert all(e["name"] == "Section 2.2 (first part)" for e in section_2_2)

    # Check values for section 2.2
    section_2_2_2020 = [e for e in result if e["number"] == "2.2" and e["year"] == 2020]
    assert len(section_2_2_2020) == 1
    assert section_2_2_2020[0]["value"] == 300.0

    section_2_2_2021 = [e for e in result if e["number"] == "2.2" and e["year"] == 2021]
    assert len(section_2_2_2021) == 1
    assert section_2_2_2021[0]["value"] == 400.0

    # Section 2.2* (second part) should have data for 2022 and 2023 only
    section_2_2_star = [e for e in result if e["number"] == "2.2*"]
    assert len(section_2_2_star) == 2
    years_2_2_star = {e["year"] for e in section_2_2_star}
    assert years_2_2_star == {2022, 2023}
    assert all(e["name"] == "Section 2.2 (second part)" for e in section_2_2_star)

    # Check values for section 2.2*
    section_2_2_star_2022 = [
        e for e in result if e["number"] == "2.2*" and e["year"] == 2022
    ]
    assert len(section_2_2_star_2022) == 1
    assert section_2_2_star_2022[0]["value"] == 500.0

    section_2_2_star_2023 = [
        e for e in result if e["number"] == "2.2*" and e["year"] == 2023
    ]
    assert len(section_2_2_star_2023) == 1
    assert section_2_2_star_2023[0]["value"] == 600.0

    # Verify they are floats, not strings
    assert isinstance(section_2_2_2020[0]["value"], float)
    assert isinstance(section_2_2_star_2022[0]["value"], float)


def test_all_expected_sections_present(mock_html_content: str) -> None:
    """Test that all expected sections are present in the flat structure."""
    result = _parse(mock_html_content)

    # Collect unique (number, name) pairs
    section_pairs = {(entry["number"], entry["name"]) for entry in result}

    expected_sections = {
        ("1", "Section 1"),
        ("1.1", "Section 1.1"),
        ("1.1.1", "Section 1.1.1"),
        ("1.1.2", "Section 1.1.2"),
        ("1.2", "Section 1.2"),
        ("2", "Section 2"),
        ("2.1", "Section 2.1"),
        ("2.2", "Section 2.2 (first part)"),
        ("2.2*", "Section 2.2 (second part)"),
        ("2.3", "Section 2.3"),
    }

    missing = expected_sections - section_pairs
    assert missing == set(), f"Missing sections: {missing}"


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
