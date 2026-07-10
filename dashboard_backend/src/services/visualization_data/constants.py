"""Dataset constants — maps dataset names to getters and consumer slugs."""

from typing import cast

from dashboard_backend.src.services.visualization_data.read_json_file import (
    JSONFileReader,
)

# Each key is a dataset name mapping to its data-getter callable and the
# visualization slugs that consume it (used for publish-status checks).
DATASETS: dict[str, dict[str, object]] = {
    "russia_gdp_constant_prices_rub": {
        "getter": JSONFileReader("russia_gdp_constant_prices_rub/gdp.json").read,
        "consumers": ["russia_gdp", "russia_economy"],
    },
    "russia_gdp_constant_prices_usd": {
        "getter": JSONFileReader("russia_gdp_constant_prices_usd/gdp.json").read,
        "consumers": ["russia_gdp"],
    },
    "russia_gdp_ppp_constant_prices": {
        "getter": JSONFileReader("russia_gdp_ppp_constant_prices/gdp.json").read,
        "consumers": ["russia_gdp", "russia_economy"],
    },
    "russia_consumer_price_index": {
        "getter": JSONFileReader("russia_consumer_price_index/cpi.json").read,
        "consumers": ["russia_inflation", "russia_economy"],
    },
    "russia_key_rate": {
        "getter": JSONFileReader("russia_key_rate/key_rate.json").read,
        "consumers": ["russia_inflation", "russia_economy"],
    },
    "russia_state_budget": {
        "getter": JSONFileReader("russia_state_budget/budget.json").read,
        "consumers": ["russia_state_budget", "russia_economy"],
    },
    "russia_trade_exports_by_country": {
        "getter": JSONFileReader(
            "russia_trade_exports/exports_by_country.json"
        ).read,
        "consumers": ["russia_trade"],
    },
    "russia_trade_exports_yearly_totals": {
        "getter": JSONFileReader(
            "russia_trade_exports/exports_yearly_totals.json"
        ).read,
        "consumers": ["russia_trade", "russia_economy"],
    },
    "russia_trade_exports_by_category": {
        "getter": JSONFileReader(
            "russia_trade_exports_by_category/exports_by_category.json"
        ).read,
        "consumers": ["russia_trade"],
    },
    "russia_trade_imports_by_country": {
        "getter": JSONFileReader(
            "russia_trade_imports/imports_by_country.json"
        ).read,
        "consumers": ["russia_trade"],
    },
    "russia_trade_imports_yearly_totals": {
        "getter": JSONFileReader(
            "russia_trade_imports/imports_yearly_totals.json"
        ).read,
        "consumers": ["russia_trade", "russia_economy"],
    },
    "russia_trade_imports_by_category": {
        "getter": JSONFileReader(
            "russia_trade_imports_by_category/imports_by_category.json"
        ).read,
        "consumers": ["russia_trade"],
    },
    "russia_salaries_average": {
        "getter": JSONFileReader("russia_salaries_average/salaries.json").read,
        "consumers": ["russia_labor_market"],
    },
    "russia_salaries_by_sector": {
        "getter": JSONFileReader("russia_salaries_by_sector/salaries.json").read,
        "consumers": ["russia_labor_market"],
    },
    "russia_labor_workforce": {
        "getter": JSONFileReader("russia_labor_workforce/workforce.json").read,
        "consumers": ["russia_labor_market", "russia_economy"],
    },
}

SLUGS: frozenset[str] = frozenset(
    slug
    for entry in DATASETS.values()
    for slug in cast(list[str], entry["consumers"])
)
