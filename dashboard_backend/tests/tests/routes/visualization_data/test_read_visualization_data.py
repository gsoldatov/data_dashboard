"""Test cases for GET /api/visualization-data/?datasets=..."""

import sys
from pathlib import Path

import pytest
from httpx import AsyncClient

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[5]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from dashboard_backend.tests.mocks.data_generator import DataGenerator
from dashboard_backend.tests.mocks.db_operations import DBOperations
from dashboard_backend.tests.mocks.setup_data import copy_test_directories
from python_common.src.config import Config

_TESTS_DIR = Path(__file__).parents[3]

# ── error handling ───────────────────────────────────────────────────────


async def test_no_token_unpublished(
    test_client: AsyncClient,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """Anonymous user gets 404 when no consumer visualization is published."""
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="russia_state_budget",
            is_published=False,
        )
    )

    test_client.cookies.clear()
    response = await test_client.get(
        "/api/visualization-data/?datasets=russia_state_budget",
    )
    assert response.status_code == 404


async def test_viewer_unpublished(
    test_client: AsyncClient,
    data_generator: DataGenerator,
    db_operations: DBOperations,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    """Viewer gets 404 when no consumer visualization is published."""
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="russia_state_budget",
            is_published=False,
        )
    )

    _user_id, cookies = viewer_session
    test_client.cookies = cookies
    response = await test_client.get(
        "/api/visualization-data/?datasets=russia_state_budget",
    )
    assert response.status_code == 404


async def test_admin_unknown_dataset(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    """Admin gets 404 when a dataset name is unknown."""
    test_client.cookies = admin_session
    response = await test_client.get(
        "/api/visualization-data/?datasets=nonexistent",
    )
    assert response.status_code == 404


async def test_admin_unknown_among_valid(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    """Admin gets 404 when any dataset name is unknown (all-or-nothing)."""
    test_client.cookies = admin_session
    response = await test_client.get(
        "/api/visualization-data/?datasets=russia_state_budget,nonexistent",
    )
    assert response.status_code == 404


async def test_admin_missing_file(
    test_client: AsyncClient,
    test_config: Config,
    temp_directory: Path,
    admin_session: dict[str, str],
) -> None:
    """Admin gets 404 when the data file for a registered dataset is missing."""
    empty_dir = temp_directory / "empty"
    empty_dir.mkdir(exist_ok=True)
    test_config.assets_directory = empty_dir
    test_client.cookies = admin_session
    response = await test_client.get(
        "/api/visualization-data/?datasets=russia_state_budget",
    )
    assert response.status_code == 404


# ── success ───────────────────────────────────────────────────────────────


async def test_success(
    test_client: AsyncClient,
    test_config: Config,
    admin_session: dict[str, str],
) -> None:
    """Valid dataset names return a {name: data} mapping."""
    expected: dict[str, object] = {
        "russia_state_budget": [{"russia_state_budget": True}],
        "russia_gdp_constant_prices_rub": [{"russia_gdp_constant_prices_rub": True}],
        "russia_gdp_constant_prices_usd": [{"russia_gdp_constant_prices_usd": True}],
        "russia_gdp_ppp_constant_prices": [{"russia_gdp_ppp_constant_prices": True}],
        "russia_consumer_price_index": [{"russia_consumer_price_index": True}],
        "russia_key_rate": [{"russia_key_rate": True}],
        "russia_salaries_average": [{"russia_salaries_average": True}],
        "russia_salaries_by_sector": [{"russia_salaries_by_sector": True}],
        "russia_labor_workforce": [{"russia_labor_workforce": True}],
        "russia_trade_exports_by_country": [
            {"russia_trade_exports_by_country": True}
        ],
        "russia_trade_exports_yearly_totals": [
            {"russia_trade_exports_yearly_totals": True}
        ],
        "russia_trade_exports_by_category": [
            {"russia_trade_exports_by_category": True}
        ],
        "russia_trade_imports_by_country": [
            {"russia_trade_imports_by_country": True}
        ],
        "russia_trade_imports_yearly_totals": [
            {"russia_trade_imports_yearly_totals": True}
        ],
        "russia_trade_imports_by_category": [
            {"russia_trade_imports_by_category": True}
        ],
    }
    copy_test_directories(
        test_config.visualization_data_directory,
        [
            "russia_state_budget",
            "russia_gdp_constant_prices_rub",
            "russia_gdp_constant_prices_usd",
            "russia_gdp_ppp_constant_prices",
            "russia_consumer_price_index",
            "russia_key_rate",
            "russia_salaries_average",
            "russia_salaries_by_sector",
            "russia_labor_workforce",
            "russia_trade_exports",
            "russia_trade_exports_by_category",
            "russia_trade_imports",
            "russia_trade_imports_by_category",
        ],
        _TESTS_DIR / "mocks" / "visualization_data",
    )
    test_client.cookies = admin_session
    all_names = list(expected.keys())
    response = await test_client.get(
        f"/api/visualization-data/?datasets={','.join(all_names)}",
    )
    assert response.status_code == 200
    assert response.json() == expected


async def test_deduplication(
    test_client: AsyncClient,
    test_config: Config,
    admin_session: dict[str, str],
) -> None:
    """Duplicate dataset names in the query are ignored."""
    copy_test_directories(
        test_config.visualization_data_directory,
        ["russia_state_budget"],
        _TESTS_DIR / "mocks" / "visualization_data",
    )
    test_client.cookies = admin_session
    response = await test_client.get(
        "/api/visualization-data/?datasets=russia_state_budget,russia_state_budget",
    )
    assert response.status_code == 200
    data = response.json()
    assert list(data.keys()) == ["russia_state_budget"]


async def test_empty_datasets(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    """Empty datasets param returns an empty object."""
    test_client.cookies = admin_session
    response = await test_client.get("/api/visualization-data/")
    assert response.status_code == 200
    assert response.json() == {}


async def test_viewer_published(
    test_client: AsyncClient,
    test_config: Config,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    """Viewer can fetch data when the consumer visualization is published."""
    copy_test_directories(
        test_config.visualization_data_directory,
        ["russia_state_budget"],
        _TESTS_DIR / "mocks" / "visualization_data",
    )
    _user_id, cookies = viewer_session
    test_client.cookies = cookies
    response = await test_client.get(
        "/api/visualization-data/?datasets=russia_state_budget",
    )
    assert response.status_code == 200
    assert response.json() == {
        "russia_state_budget": [{"russia_state_budget": True}],
    }
