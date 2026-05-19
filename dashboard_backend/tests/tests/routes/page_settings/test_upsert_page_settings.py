"""Test cases for PUT /api/page-settings/{slug}."""

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

# ── validation ────────────────────────────────────────────────────────────


async def test_upsert_page_settings_validation(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    invalid_cases = [
        ({}, 422),
        ({"is_published": "notabool"}, 422),
        ({"is_published": 123}, 422),
    ]
    for payload, expected_status in invalid_cases:
        response = await test_client.put(
            "/api/page-settings/test-page",
            json=payload,
        )
        assert response.status_code == expected_status


# ── auth failures ─────────────────────────────────────────────────────────


async def test_upsert_page_settings_no_token(test_client: AsyncClient) -> None:
    test_client.cookies.clear()
    response = await test_client.put(
        "/api/page-settings/test-page",
        json={"is_published": True},
    )
    assert response.status_code == 401


async def test_upsert_page_settings_viewer_token(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
) -> None:
    _user_id, cookies = viewer_session
    test_client.cookies = cookies

    response = await test_client.put(
        "/api/page-settings/test-page",
        json={"is_published": True},
    )

    assert response.status_code == 403


# ── success ───────────────────────────────────────────────────────────────


async def test_upsert_page_settings_insert(
    test_client: AsyncClient,
    admin_session: dict[str, str],
) -> None:
    test_client.cookies = admin_session
    response = await test_client.put(
        "/api/page-settings/new-page",
        json={"is_published": False},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["slug"] == "new-page"
    assert body["is_published"] is False
    assert "id" in body


async def test_upsert_page_settings_update(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    await db_operations.pages_settings.insert(
        data_generator.pages_settings.page_settings(
            slug="existing-page",
            is_published=True,
        )
    )

    test_client.cookies = admin_session
    response = await test_client.put(
        "/api/page-settings/existing-page",
        json={"is_published": False},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["slug"] == "existing-page"
    assert body["is_published"] is False

    # Verify DB state
    stored = await db_operations.pages_settings.by_slug("existing-page")
    assert stored is not None
    assert stored.is_published is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
