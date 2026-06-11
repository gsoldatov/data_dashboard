"""Test cases for GET /api/visualization-settings/ (batch)."""

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

_BATCH_URL = "/api/visualization-settings/"


# ── validation ─────────────────────────────────────────────────────────────


async def test_missing_settings_param(
    test_client: AsyncClient,
) -> None:
    """422 when ``settings`` query param is missing."""
    test_client.cookies.clear()
    response = await test_client.get(f"{_BATCH_URL}?slugs=a")
    assert response.status_code == 422


async def test_missing_slugs_param(
    test_client: AsyncClient,
) -> None:
    """422 when ``slugs`` query param is missing."""
    test_client.cookies.clear()
    response = await test_client.get(f"{_BATCH_URL}?settings=is-published")
    assert response.status_code == 422


async def test_empty_settings(
    test_client: AsyncClient,
) -> None:
    """422 when ``settings`` is empty."""
    test_client.cookies.clear()
    response = await test_client.get(f"{_BATCH_URL}?settings=&slugs=a")
    assert response.status_code == 422


async def test_empty_slugs(
    test_client: AsyncClient,
) -> None:
    """422 when ``slugs`` is empty."""
    test_client.cookies.clear()
    response = await test_client.get(
        f"{_BATCH_URL}?settings=is-published&slugs="
    )
    assert response.status_code == 422


async def test_unknown_setting_name(
    test_client: AsyncClient,
) -> None:
    """422 when a setting name is not recognised."""
    test_client.cookies.clear()
    response = await test_client.get(
        f"{_BATCH_URL}?settings=unknown&slugs=a"
    )
    assert response.status_code == 422


# ── unauthenticated ─────────────────────────────────────────────────────────


async def test_batch_unauthenticated(
    test_client: AsyncClient,
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """Unauthenticated: returns default is_published for every slug."""
    test_client.cookies.clear()

    # Slug with no stored settings → default is_published=True
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="pub-unauthed", is_published=True
        )
    )
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="unpub-unauthed", is_published=False
        )
    )

    response = await test_client.get(
        f"{_BATCH_URL}"
        "?settings=is-published"
        "&slugs=default-unauthed,pub-unauthed,unpub-unauthed"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["default-unauthed"] == {"is_published": True}
    assert data["pub-unauthed"] == {"is_published": True}
    assert data["unpub-unauthed"] == {"is_published": False}


# ── viewer ──────────────────────────────────────────────────────────────────


async def test_batch_viewer(
    test_client: AsyncClient,
    viewer_session: tuple[int, dict[str, str]],
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """Viewer: same rules as unauthenticated."""
    _user_id, cookies = viewer_session
    test_client.cookies = cookies

    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="pub-viewer", is_published=True
        )
    )
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="unpub-viewer", is_published=False
        )
    )

    response = await test_client.get(
        f"{_BATCH_URL}"
        "?settings=is-published"
        "&slugs=default-viewer,pub-viewer,unpub-viewer"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["default-viewer"] == {"is_published": True}
    assert data["pub-viewer"] == {"is_published": True}
    assert data["unpub-viewer"] == {"is_published": False}


# ── admin ───────────────────────────────────────────────────────────────────


async def test_batch_admin(
    test_client: AsyncClient,
    admin_session: dict[str, str],
    data_generator: DataGenerator,
    db_operations: DBOperations,
) -> None:
    """Admin: always returns is_published=True regardless of stored value."""
    test_client.cookies = admin_session

    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="pub-admin", is_published=True
        )
    )
    await db_operations.visualizations_settings.insert(
        data_generator.visualization_settings.visualization_settings(
            slug="unpub-admin", is_published=False
        )
    )

    response = await test_client.get(
        f"{_BATCH_URL}"
        "?settings=is-published"
        "&slugs=default-admin,pub-admin,unpub-admin"
    )
    assert response.status_code == 200
    data = response.json()
    assert data["default-admin"] == {"is_published": True}
    assert data["pub-admin"] == {"is_published": True}
    # Admin sees unpublished as published
    assert data["unpub-admin"] == {"is_published": True}


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
