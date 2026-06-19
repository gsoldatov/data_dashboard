"""
Test cases for Russia state budget parsing logic
"""
import sys
from pathlib import Path
from typing import Any

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
    years = list(result["1"]["data"].keys())
    assert years == ["2020", "2021", "2022", "2023"]


def test_filtering_visual_indentation_rows(mock_html_content: str) -> None:
    """Test that visual indentation rows (РАЗДЕЛ) are filtered out."""
    result = _parse(mock_html_content)
    
    # Check that neither РАЗДЕЛ I nor РАЗДЕЛ II appear in the result
    assert "РАЗДЕЛ I" not in str(result)
    assert "РАЗДЕЛ II" not in str(result)
    
    # More specifically, check that no section names start with РАЗДЕЛ
    def check_section_names(obj: Any) -> None:
        if isinstance(obj, dict):
            if "name" in obj and isinstance(obj["name"], str):
                assert not obj["name"].startswith("РАЗДЕЛ"), \
                    f"Found section starting with РАЗДЕЛ: {obj['name']}"
            # Recursively check children
            if "children" in obj:
                for child in obj["children"].values():
                    check_section_names(child)
        elif isinstance(obj, list):
            for item in obj:
                check_section_names(item)
    
    check_section_names(result)


def test_removing_trailing_asterisks_from_section_names(mock_html_content: str) -> None:
    """Test that trailing asterisks are removed from section names."""
    result = _parse(mock_html_content)
    
    # Section 2 should not have an asterisk in its name
    section_2_name = result["2"]["name"]
    assert section_2_name == "Section 2"
    assert section_2_name != "Section 2*"
    
    # Verify no section names end with asterisk
    def check_no_asterisk_in_names(obj: Any) -> None:
        if isinstance(obj, dict):
            if "name" in obj and isinstance(obj["name"], str):
                assert not obj["name"].endswith("*"), \
                    f"Found section name ending with asterisk: {obj['name']}"
            # Recursively check children
            if "children" in obj:
                for child in obj["children"].values():
                    check_no_asterisk_in_names(child)
        elif isinstance(obj, list):
            for item in obj:
                check_no_asterisk_in_names(item)
    
    check_no_asterisk_in_names(result)


def test_parsing_numbers_with_spaces(mock_html_content: str) -> None:
    """Test that numbers with spaces are correctly parsed."""
    result = _parse(mock_html_content)
    
    # Section 2 should have the value 1300.0 for 2020 (from "1&nbsp;300.0")
    section_2_2020_value = result["2"]["data"]["2020"]
    assert section_2_2020_value == 1300.0
    
    # Verify the value is a float, not a string
    assert isinstance(section_2_2020_value, float)


def test_hierarchical_structure_validation(mock_html_content: str) -> None:
    """Test that the hierarchical structure is built correctly."""
    result = _parse(mock_html_content)
    
    # Check main sections exist
    assert "1" in result
    assert "2" in result
    
    # Check section 1 properties
    assert result["1"]["name"] == "Section 1"
    assert result["1"]["data"]["2020"] == 1000.0
    assert result["1"]["data"]["2021"] == 1100.0
    assert result["1"]["data"]["2022"] == 1200.0
    assert result["1"]["data"]["2023"] == 1300.0
    
    # Check subsection 1.1
    assert "1.1" in result["1"]["children"]
    assert result["1"]["children"]["1.1"]["name"] == "Section 1.1"
    assert result["1"]["children"]["1.1"]["data"]["2020"] == 400.0
    assert result["1"]["children"]["1.1"]["data"]["2021"] == 500.0
    assert result["1"]["children"]["1.1"]["data"]["2022"] == 600.0
    assert result["1"]["children"]["1.1"]["data"]["2023"] == 700.0
    
    # Check subsection 1.1.1
    assert "1.1.1" in result["1"]["children"]["1.1"]["children"]
    assert result["1"]["children"]["1.1"]["children"]["1.1.1"]["name"] == \
        "Section 1.1.1"
    assert result["1"]["children"]["1.1"]["children"]["1.1.1"]["data"]["2020"] == 100.0
    assert result["1"]["children"]["1.1"]["children"]["1.1.1"]["data"]["2021"] == 200.0
    assert result["1"]["children"]["1.1"]["children"]["1.1.1"]["data"]["2022"] == 300.0
    assert result["1"]["children"]["1.1"]["children"]["1.1.1"]["data"]["2023"] == 400.0
    
    # Check subsection 1.1.2
    assert "1.1.2" in result["1"]["children"]["1.1"]["children"]
    assert result["1"]["children"]["1.1"]["children"]["1.1.2"]["name"] == \
        "Section 1.1.2"
    assert result["1"]["children"]["1.1"]["children"]["1.1.2"]["data"]["2020"] == 300.0
    assert result["1"]["children"]["1.1"]["children"]["1.1.2"]["data"]["2021"] == 400.0
    assert result["1"]["children"]["1.1"]["children"]["1.1.2"]["data"]["2022"] == 500.0
    assert result["1"]["children"]["1.1"]["children"]["1.1.2"]["data"]["2023"] == 600.0
    
    # Check subsection 1.2
    assert "1.2" in result["1"]["children"]
    assert result["1"]["children"]["1.2"]["name"] == "Section 1.2"
    assert result["1"]["children"]["1.2"]["data"]["2020"] == 600.0
    assert result["1"]["children"]["1.2"]["data"]["2021"] == 600.0
    assert result["1"]["children"]["1.2"]["data"]["2022"] == 600.0
    assert result["1"]["children"]["1.2"]["data"]["2023"] == 600.0


def test_multiline_section_handling(mock_html_content: str) -> None:
    """Test that multiline sections are properly handled."""
    result = _parse(mock_html_content)
    
    # Section 2.2 (first part) should exist
    assert "2.2" in result["2"]["children"]
    section_2_2 = result["2"]["children"]["2.2"]
    assert section_2_2["name"] == "Section 2.2 (first part)"
    
    # First part has data for 2020 and 2021 only
    assert section_2_2["data"]["2020"] == 300.0
    assert section_2_2["data"]["2021"] == 400.0
    assert "2022" not in section_2_2["data"]
    assert "2023" not in section_2_2["data"]
    
    # Section 2.2* (second part) should exist with asterisk in the key
    assert "2.2*" in result["2"]["children"]
    section_2_2_star = result["2"]["children"]["2.2*"]
    assert section_2_2_star["name"] == "Section 2.2 (second part)"
    
    # Second part has data for 2022 and 2023 only
    assert "2020" not in section_2_2_star["data"]
    assert "2021" not in section_2_2_star["data"]
    assert section_2_2_star["data"]["2022"] == 500.0
    assert section_2_2_star["data"]["2023"] == 600.0
    
    # Verify they are floats, not strings
    assert isinstance(section_2_2["data"]["2020"], float)
    assert isinstance(section_2_2_star["data"]["2022"], float)


def test_all_expected_sections_present(mock_html_content: str) -> None:
    """Test that all expected sections are present in the hierarchy."""
    result = _parse(mock_html_content)
    
    # Collect all section names from the hierarchy
    section_names = []
    
    def collect_section_names(obj: Any, path: str) -> None:
        if isinstance(obj, dict):
            # Check if this is a section (has "name" key) - use the provided path
            if "name" in obj:
                section_names.append((path, obj["name"]))
            # Recursively check children - the key IS the full path
            if "children" in obj:
                for key, child in obj["children"].items():
                    collect_section_names(child, key)
    
    # First, collect top-level sections (1, 2, etc.)
    for key, section in result.items():
        collect_section_names(section, key)
    
    # Convert to dict for easier checking
    section_dict = {path: name for path, name in section_names}
    
    # Check that all expected sections are present with correct names
    expected_sections = {
        "1": "Section 1",
        "1.1": "Section 1.1",
        "1.1.1": "Section 1.1.1",
        "1.1.2": "Section 1.1.2",
        "1.2": "Section 1.2",
        "2": "Section 2",  # Asterisk removed
        "2.1": "Section 2.1",
        "2.2": "Section 2.2 (first part)",  # Multiline section - name from first part
        "2.3": "Section 2.3"
    }
    
    for section_path, expected_name in expected_sections.items():
        assert section_path in section_dict, f"Missing section: {section_path}"
        assert section_dict[section_path] == expected_name, (
            f"Section {section_path} has name '{section_dict[section_path]}', "
            f"expected '{expected_name}'"
        )


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])