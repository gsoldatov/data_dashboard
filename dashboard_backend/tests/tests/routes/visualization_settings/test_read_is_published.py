"""Test cases for GET /api/visualization-settings/{slug}/is-published."""

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


async def test_read_is_published_unauthenticated(
    test_client: AsyncClient,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """Unauthenticated users: published visualizations → 200, unpublished → 403."""
    test_client.cookies.clear()

    # Default (no stored settings → is_published=True)
    response = await test_client.get(
        "/api/visualization-settings/default-unauthed/is-published",
    )
    assert response.status_code == 200

    # Custom published
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="published-unauthed", is_published=True
        )
    )
    response = await test_client.get(
        "/api/visualization-settings/published-unauthed/is-published",
    )
    assert response.status_code == 200

    # Custom unpublished
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="unpublished-unauthed", is_published=False
        )
    )
    response = await test_client.get(
        "/api/visualization-settings/unpublished-unauthed/is-published",
    )
    assert response.status_code == 403


async def test_read_is_published_viewer(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """Viewer users: same rules as unauthenticated."""
    _user_id, cookies = viewer_session
    test_client.cookies = cookies

    # Default
    response = await test_client.get(
        "/api/visualization-settings/default-viewer/is-published",
    )
    assert response.status_code == 200

    # Custom published
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="published-viewer", is_published=True
        )
    )
    response = await test_client.get(
        "/api/visualization-settings/published-viewer/is-published",
    )
    assert response.status_code == 200

    # Custom unpublished
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="unpublished-viewer", is_published=False
        )
    )
    response = await test_client.get(
        "/api/visualization-settings/unpublished-viewer/is-published",
    )
    assert response.status_code == 403


async def test_read_is_published_admin(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """Admin users: always 200 regardless of publish status."""
    test_client.cookies = admin_session

    # Default
    response = await test_client.get(
        "/api/visualization-settings/default-admin/is-published",
    )
    assert response.status_code == 200

    # Custom published
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="published-admin", is_published=True
        )
    )
    response = await test_client.get(
        "/api/visualization-settings/published-admin/is-published",
    )
    assert response.status_code == 200

    # Custom unpublished (admin can still view)
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="unpublished-admin", is_published=False
        )
    )
    response = await test_client.get(
        "/api/visualization-settings/unpublished-admin/is-published",
    )
    assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
