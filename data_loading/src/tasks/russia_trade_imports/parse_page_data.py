import json
import logging
import re
from typing import Any

import pycountry
from airflow.sdk import task

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[4]
    sys.path.insert(0, str(PROJECT_ROOT))

from python_common.src import Config, get_config

# Mapping from WITS partner names to ISO country names for pycountry lookup.
# Entries mapped to None are explicitly excluded (not real countries).
_WITS_TO_ISO: dict[str, str | None] = {
    "Anguila": "Anguilla",
    "Bahamas, The": "Bahamas",
    "Belgium-Luxembourg": "Belgium",
    "British Indian Ocean Ter.": "British Indian Ocean Territory",
    "Brunei": "Brunei Darussalam",
    "Cape Verde": "Cabo Verde",
    "Congo, Dem. Rep.": "Congo, The Democratic Republic of the",
    "Congo, Rep.": "Congo",
    "East Timor": "Timor-Leste",
    "Egypt, Arab Rep.": "Egypt",
    "Ethiopia(excludes Eritrea)": "Ethiopia",
    "Faeroe Islands": "Faroe Islands",
    "Fm Sudan": None,
    "Fr. So. Ant. Tr": "French Southern Territories",
    "Gambia, The": "Gambia",
    "Hong Kong, China": "Hong Kong",
    "Iran, Islamic Rep.": "Iran, Islamic Republic of",
    "Korea, Dem. Rep.": "Korea, Democratic People's Republic of",
    "Korea, Rep.": "Korea, Republic of",
    "Lao PDR": "Lao People's Democratic Republic",
    "Micronesia, Fed. Sts.": "Micronesia, Federated States of",
    "Netherlands Antilles": None,
    "Occ.Pal.Terr": "Palestine, State of",
    "Other Asia, nes": None,
    "Saint Maarten (Dutch part)": "Sint Maarten (Dutch part)",
    "Serbia, FR(Serbia/Montenegro)": "Serbia",
    "Slovak Republic": "Slovakia",
    "Special Categories": None,
    "St. Kitts and Nevis": "Saint Kitts and Nevis",
    "St. Lucia": "Saint Lucia",
    "St. Vincent and the Grenadines": "Saint Vincent and the Grenadines",
    "Turkey": "Türkiye",
    "Turks and Caicos Isl.": "Turks and Caicos Islands",
    "Unspecified": None,
    "Us Msc.Pac.I": "United States Minor Outlying Islands",
    "Wallis and Futura Isl.": "Wallis and Futuna",
}

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
        if not _is_country(name):
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


def _is_country(name: str) -> bool:
    """
    Returns True if the given WITS partner name corresponds to a real country
    or territory (as opposed to aggregates like 'Special Categories').
    """
    # Check explicit mapping first
    if name in _WITS_TO_ISO:
        return _WITS_TO_ISO[name] is not None

    # Try direct pycountry lookup
    try:
        pycountry.countries.lookup(name)
        return True
    except LookupError:
        pass

    # Try fuzzy search as fallback
    try:
        results = pycountry.countries.search_fuzzy(name)
        if results:
            return True
    except LookupError:
        pass

    return False


if __name__ == "__main__":
    parse_page_data_task.function()
