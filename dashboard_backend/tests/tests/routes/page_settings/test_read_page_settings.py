"""Test cases for GET /api/page-settings/{slug}."""

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

# ── auth failures ─────────────────────────────────────────────────────────


async def test_read_page_settings_no_token(test_client: AsyncClient) -> None:
    test_client.cookies.clear()
    response = await test_client.get(
        "/api/page-settings/some-page",
    )
    assert response.status_code == 401


async def test_read_page_settings_viewer_token(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    _user_id, cookies = viewer_session
    test_client.cookies = cookies

    response = await test_client.get(
        "/api/page-settings/some-page",
    )

    assert response.status_code == 403


# ── success ───────────────────────────────────────────────────────────────


async def test_read_page_settings_defaults(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    response = await test_client.get(
        "/api/page-settings/nonexistent",
    )

    assert response.status_code == 200
    body = response.json()
    assert body == {"slug": "nonexistent", "is_published": True}


async def test_read_page_settings_stored(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    await db_operations.pages_settings.insert(
        data_generator.pages_settings.page_settings(
            slug="my-page",
            is_published=False,
        )
    )

    test_client.cookies = admin_session
    response = await test_client.get(
        "/api/page-settings/my-page",
    )

    assert response.status_code == 200
    body = response.json()
    assert body == {"slug": "my-page", "is_published": False}


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
