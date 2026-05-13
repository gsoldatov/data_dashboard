"""Maps page slugs to data-reading functions and file paths."""

from pathlib import Path

# TODO 
# - implement properly:
#   - service is called by route handler;
#   - service gets the correct data handler(-s) or throws;
#   - service gets data from each data handler and returns it to route handler;

# Registry of known visualization data.
# Each entry maps a page slug to a function that returns data as a dict.
DATA_REGISTRY: dict[str, str] = {
    # "russia-budget": "russia_state_budget/parsed.json",
}


def get_data_path(slug: str, data_directory: Path) -> Path | None:
    """Return the absolute path to the data file for a given slug, or None."""
    relative_path = DATA_REGISTRY.get(slug)
    if relative_path is None:
        return None
    return data_directory / relative_path
