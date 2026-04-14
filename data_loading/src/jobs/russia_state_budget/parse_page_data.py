import asyncio
import json
from pathlib import Path
import traceback
from typing import Dict, Any

from prefect import flow

if __name__ == "__main__":
    from pathlib import Path
    import sys

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from bs4 import BeautifulSoup
from data_loading.src.jobs.base_job import BaseJob

from python_common.src import get_config


class RussiaStateBudgetParsePageData(BaseJob):
    """
    Parses an HTML page with Russia's state budget into JSON
    """
    @flow(name="Russia state budget parse page data")
    async def run(self) -> None:
        page_path = self.settings.data_directory / "russia_state_budget" / "budget.html"
        json_path = self.settings.data_directory / "russia_state_budget" / "budget.json"

        try:
            # Load HTML file
            with open(page_path, "r", encoding="utf-8") as f:
                html_content = f.read()

            # Parse HTML with BeautifulSoup
            soup = BeautifulSoup(html_content, "html.parser")

            # Find the table (only one table in the document)
            table = soup.find("table")
            if table is None:
                raise ValueError("Table not found in HTML document")

            # Extract years from table headers
            headers = table.find("thead")
            if headers is None:
                raise ValueError("Table header not found")
            headers = headers.find_all("th")
            years = [header.get_text(strip=True).rstrip(" *") for header in headers[2:]]

            # Initialize hierarchical data structure
            data = {}

            # Process table rows
            current_section = None
            prev_section_num = None

            tbody = table.find("tbody")
            if tbody is None:
                raise ValueError("Table body not found")
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

                # Handle sections without section numbers that should inherit previous section number with asterisk
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
                        "data": {years[i]: values[i] for i in range(len(years)) if values[i] is not None},
                        "children": {}
                    }
                    data[section_num] = current_section
                elif section_num and "." in section_num:
                    # Subsection
                    if current_section is not None:
                        subsection_num = section_num
                        subsection = {
                            "name": section_name,
                            "data": {years[i]: values[i] for i in range(len(years)) if values[i] is not None},
                            "children": {}
                        }
                        # Add to parent section's children
                        parent_num = section_num.split(".")[0]
                        if parent_num in data:
                            data[parent_num]["children"][subsection_num] = subsection
                        else:
                            # Find the correct parent in the hierarchy
                            self._add_to_hierarchy(data, subsection_num, subsection)
                
                # Save the number of the previous section
                # (to reuse for sections without numbers)
                prev_section_num = section_num

            # Save to JSON
            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)

            self.log(f"Successfully saved budget data to {json_path}")
        except Exception as e:
            self.log(
                f"An exception occured during file parsing: {str(e)}"
                f"\n{traceback.print_exc()}"
            )

    def _add_to_hierarchy(self, data: Dict[str, Any], subsection_num: str, subsection: Dict[str, Any]) -> None:
        """Helper method to add subsection to the correct parent in hierarchy."""
        parts = subsection_num.split(".")
        if len(parts) == 2:
            parent_num = parts[0]
            if parent_num in data:
                data[parent_num]["children"][subsection_num] = subsection
        elif len(parts) > 2:
            # Find the correct parent by traversing the hierarchy
            parent_num = ".".join(parts[:-1])
            current = data
            for part in parts[:-1]:
                if part in current:
                    current = current[part]["children"]
                else:
                    break
            current[subsection_num] = subsection


if __name__ == "__main__":
    settings = get_config()
    job = RussiaStateBudgetParsePageData(settings)
    asyncio.run(job.run.fn(job))