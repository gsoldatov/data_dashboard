import json
import logging
import traceback
from pathlib import Path
from typing import Any

from bs4 import BeautifulSoup
from prefect import flow

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.helpers import get_logger
from python_common.src import Config, get_config


@flow(name="Russia state budget parse page data")
def russia_state_budget_parse_page_data(
    config: Config | None = None,
    logger: logging.LoggerAdapter[logging.Logger] | None = None
) -> None:
    """
    Parses an HTML page with Russia's state budget into JSON
    """
    config = config or get_config()
    logger = logger or get_logger(config, "russia_state_budget_parse_page_data")
    page_path = config.data_directory / "russia_state_budget" / "budget.html"
    json_path = config.data_directory / "russia_state_budget" / "budget.json"

    logger.info("Started Russia state budget parsing")

    try:
        # Load HTML file
        if not page_path.is_file():
            raise RuntimeError("Russia state budget HTML file does not exist")
        
        with open(page_path, encoding="utf-8") as f:
            html_content = f.read()

        # Parse HTML data
        data = _parse(html_content)

        # Save to JSON
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        logger.info(f"Successfully saved budget data to {json_path}")
    except Exception as e:
        traceback.print_exc()
        logger.error(
            f"An exception occured during file parsing: {str(e)}"
        )


def _parse(html_content: str) -> dict[str, Any]:
    """
    Parses a string containing an HTML document
    and forms a hierarchical data structure containing budget table data.
    """
    # Parse HTML with BeautifulSoup
    soup = BeautifulSoup(html_content, "html.parser")

    # Find the table (only one table in the document)
    table = soup.find("table")
    if table is None:
        raise ValueError("Russia state budget HTML does not contain a table")

    # Extract years from table headers
    header_row = table.find("thead")
    if header_row is None:
        raise ValueError("Russia state budget HTML table does not contain a header")
    header_cells = header_row.find_all("th")
    years = [cell.get_text(strip=True).rstrip(" *\xa0") for cell in header_cells[2:]]

    # Initialize hierarchical data structure
    data = {}

    # Process table rows
    current_section = None
    prev_section_num = None

    tbody = table.find("tbody")
    if tbody is None:
        raise ValueError("Russia state budget HTML table does not contain body")

    for row in tbody.find_all("tr"):
        cells = row.find_all(["td", "th"])

        # Skip empty rows
        if len(cells) < 2:
            continue

        # Get section number and name
        section_num_cell = cells[0]
        section_name_cell = cells[1]

        section_num = section_num_cell.get_text(strip=True).rstrip(". *")
        section_name = section_name_cell.get_text(strip=True).rstrip(" *")

        # Handle sections without section numbers that should inherit
        # previous section number with asterisk
        if not section_num and section_name and prev_section_num:
            section_num = f"{prev_section_num}*"

        # Skip section headers (РАЗДЕЛ I, РАЗДЕЛ II, etc.)
        if section_name.startswith("РАЗДЕЛ"):
            continue

        # Get annual values
        values = []
        for cell in cells[2:]:
            value_text = cell.get_text(strip=True)
            # Convert to float, handling empty cells
            if value_text:
                # Remove non-breaking spaces and convert to float
                value = float(value_text.replace("\xa0", "").replace(" ", ""))
            else:
                value = None
            values.append(value)

        # Create hierarchical structure
        if section_num and section_num.isdigit():
            # Main section
            current_section = {
                "name": section_name,
                "data": {
                    years[i]: values[i] for i in range(len(years))
                    if values[i] is not None
                },
                "children": {}
            }
            data[section_num] = current_section
        elif section_num and "." in section_num:
            # Subsection
            if current_section is not None:
                subsection_num = section_num
                subsection = {
                    "name": section_name,
                    "data": {
                        years[i]: values[i] for i in range(len(years))
                        if values[i] is not None
                    },
                    "children": {}
                }
                # Add to the correct parent in the hierarchy
                _add_to_hierarchy(data, subsection_num, subsection)
        
        # Save the number of the previous section
        # (to reuse for sections without numbers)
        prev_section_num = section_num
    
    return data


def _add_to_hierarchy(
    data: dict[str, Any],
    subsection_num: str,
    subsection: dict[str, Any]
) -> None:
    """Helper method to add subsection to the correct parent in hierarchy."""
    parts = subsection_num.split(".")
    if len(parts) == 2:
        parent_num = parts[0]
        if parent_num in data:
            data[parent_num]["children"][subsection_num] = subsection
    elif len(parts) > 2:
        # Find the correct parent by traversing the hierarchy
        # Build parent keys progressively: for "1.1.1", check "1", then "1.1"
        # and finally add to 1.1's children
        current = data
        parent_key = parts[0]
        for i in range(1, len(parts)):
            if parent_key in current:
                current = current[parent_key]["children"]
                if i < len(parts) - 1:
                    parent_key = ".".join(parts[:i + 1])
            else:
                break
        else:
            # Successfully traversed to the parent, add the subsection
            current[subsection_num] = subsection


if __name__ == "__main__":
    russia_state_budget_parse_page_data.fn()
