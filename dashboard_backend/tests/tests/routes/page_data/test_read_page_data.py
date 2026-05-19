"""Test cases for GET /api/page-data/{slug}."""

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

# ── error handling ───────────────────────────────────────────────────────


async def test_read_page_data_no_token_unpublished(
    test_client: AsyncClient,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """Anonymous user gets 404 when the page is unpublished."""
    await db_operations.pages_settings.insert(
        data_generator.pages_settings.page_settings(
            slug="russia_state_budget",
            is_published=False,
        )
    )

    test_client.cookies.clear()
    response = await test_client.get(
        "/api/page-data/russia_state_budget",
    )
    assert response.status_code == 404


async def test_read_page_data_viewer_unpublished(
    test_client: AsyncClient,
    data_generator: DataGenerator,
    db_operations: DBOperations,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    """Viewer gets 404 when the page is unpublished."""
    await db_operations.pages_settings.insert(
        data_generator.pages_settings.page_settings(
            slug="russia_state_budget",
            is_published=False,
        )
    )

    _user_id, cookies = viewer_session
    test_client.cookies = cookies
    response = await test_client.get(
        "/api/page-data/russia_state_budget",
    )
    assert response.status_code == 404


async def test_read_page_data_admin_no_getter(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    """Admin gets 404 when no data getter is registered for the slug."""
    test_client.cookies = admin_session
    response = await test_client.get(
        "/api/page-data/nonexistent",
    )
    assert response.status_code == 404


# ── success ───────────────────────────────────────────────────────────────


async def test_read_page_data_success(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    """Valid slugs return the data read by their registered getter."""
    test_client.cookies = admin_session
    slugs = ["russia_state_budget"]
    for slug in slugs:
        response = await test_client.get(
            f"/api/page-data/{slug}",
        )
        assert response.status_code == 200
        assert response.json() == [{slug: True}]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
