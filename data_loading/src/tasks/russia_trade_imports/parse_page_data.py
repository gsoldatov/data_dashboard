import json
import logging
import re
from typing import Any

from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from python_common.src import Config, get_config

# WITS region/aggregate entries to exclude.
# These are only present in the ALL view, but the blocklist serves as a safety
# net in case the data source changes.
_EXCLUDED_REGIONS: frozenset[str] = frozenset({
    "World",
    "East Asia & Pacific",
    "Europe & Central Asia",
    "Latin America & Caribbean",
    "Middle East, North Africa, Afghanistan & Pakistan",
    "North America",
    "South Asia",
    "Sub-Saharan Africa",
})

# Regex to extract JS arrays from the page source
_RE_PARTNER_NAMES = re.compile(r"RPartnerName\s*=\s*(\[.*?\]);", re.DOTALL)
_RE_YEAR_DATA = re.compile(r"R(\d{4})\s*=\s*(\[.*?\]);", re.DOTALL)

# Thousands to raw USD conversion factor
_THOUSANDS_TO_USD = 1000


@task
def parse_page_data_task(config: Config | None = None) -> None:
    """
    Parses an HTML page with Russia's import trade data into JSON files:
    - imports_by_country.json: list of {year, country, value}
    - imports_yearly_totals.json: list of {year, value}
    """
    logger = logging.getLogger("airflow.task")

    config = config or get_config()
    data_dir = config.visualization_data_directory
    page_path = data_dir / "russia_trade_imports" / "page.html"
    by_country_path = data_dir / "russia_trade_imports" / "imports_by_country.json"
    totals_path = data_dir / "russia_trade_imports" / "imports_yearly_totals.json"

    logger.info("Parsing Russia trade imports HTML page")

    try:
        if not page_path.is_file():
            raise RuntimeError("Russia trade imports HTML file does not exist")

        logger.debug("Reading HTML from %s", page_path)
        with open(page_path, encoding="utf-8") as f:
            html_content = f.read()

        by_country, totals = _parse(html_content)

        logger.debug("Writing by-country JSON output to %s", by_country_path)
        with open(by_country_path, "w", encoding="utf-8") as f:
            json.dump(by_country, f, ensure_ascii=False, indent=2)

        logger.debug("Writing yearly totals JSON output to %s", totals_path)
        with open(totals_path, "w", encoding="utf-8") as f:
            json.dump(totals, f, ensure_ascii=False, indent=2)

        logger.info(
            "Saved trade imports data: %d by-country entries, %d yearly totals",
            len(by_country),
            len(totals),
        )
    except Exception:
        logger.exception("Failed to parse HTML page")
        raise


def _parse(
    html_content: str,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    """
    Parses a string containing an HTML document with embedded JS arrays
    and returns (by_country_list, yearly_totals_list).
    """
    # Extract partner names
    names_match = _RE_PARTNER_NAMES.search(html_content)
    if names_match is None:
        raise ValueError(
            "Russia trade imports HTML does not contain RPartnerName array"
        )
    partner_names = json.loads(names_match.group(1))

    # Extract yearly data arrays
    year_matches = _RE_YEAR_DATA.findall(html_content)
    if not year_matches:
        raise ValueError(
            "Russia trade imports HTML does not contain yearly data arrays"
        )

    years_data: dict[int, list[str]] = {}
    for year_str, array_str in year_matches:
        years_data[int(year_str)] = json.loads(array_str)

    # Validate that all year arrays have the same length as partner_names
    for year, values in years_data.items():
        if len(values) != len(partner_names):
            raise ValueError(
                f"Year {year} has {len(values)} entries, "
                f"but {len(partner_names)} partner names"
            )

    by_country: list[dict[str, Any]] = []
    yearly_sums: dict[int, float] = {}

    for idx, name in enumerate(partner_names):
        if name in _EXCLUDED_REGIONS:
            continue

        for year, values in sorted(years_data.items()):
            raw_value = values[idx]
            if not raw_value:
                continue

            value = float(raw_value) * _THOUSANDS_TO_USD
            by_country.append({
                "year": year,
                "country": name,
                "value": value,
            })
            yearly_sums[year] = yearly_sums.get(year, 0.0) + value

    by_country.sort(key=lambda e: (e["year"], e["country"]))

    totals: list[dict[str, Any]] = [
        {"year": year, "value": round(value, 2)}
        for year, value in sorted(yearly_sums.items())
    ]

    return by_country, totals


if __name__ == "__main__":
    parse_page_data_task.function()
