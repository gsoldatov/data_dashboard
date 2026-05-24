"""Test cases for CORS middleware configuration."""

import sys
from collections.abc import AsyncGenerator
from pathlib import Path

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncConnection, create_async_engine

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[4]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from fastapi import FastAPI

from dashboard_backend.src.app import create_app
from python_common.src.config import Config

_ALLOWED_ORIGIN = "http://allowed-origin.com"

# ── fixtures ──────────────────────────────────────────────────────────────


@pytest.fixture
async def app_with_cors(
    test_config: Config, test_db: AsyncConnection
) -> AsyncGenerator[FastAPI]:
    """FastAPI app configured with a single allowed CORS origin.

    Overrides ``test_config.backend_cors_origins`` to ``_ALLOWED_ORIGIN``
    so the CORS middleware rejects other origins.
    """
    test_config.backend_cors_origins = _ALLOWED_ORIGIN
    app = create_app(test_config)
    engine = create_async_engine(test_config.backend_database_url, echo=False)
    app.state.engine = engine

    yield app

    await engine.dispose()


@pytest.fixture
async def cors_client(app_with_cors: FastAPI) -> AsyncGenerator[AsyncClient]:
    """httpx async client pointed at *app_with_cors*."""
    transport = ASGITransport(app=app_with_cors)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


# ── valid origin ──────────────────────────────────────────────────────────


async def test_cors_allowed_origin_get(cors_client: AsyncClient) -> None:
    """GET request from the allowed origin includes CORS headers."""
    response = await cors_client.get(
        "/api/visualization-data/some-page",
        headers={"Origin": _ALLOWED_ORIGIN},
    )
    assert response.status_code != 500
    assert response.headers["access-control-allow-origin"] == _ALLOWED_ORIGIN
    assert response.headers["access-control-allow-credentials"] == "true"


async def test_cors_allowed_origin_preflight(cors_client: AsyncClient) -> None:
    """OPTIONS preflight from the allowed origin includes CORS headers."""
    response = await cors_client.options(
        "/api/visualization-data/some-page",
        headers={
            "Origin": _ALLOWED_ORIGIN,
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == _ALLOWED_ORIGIN
    assert response.headers["access-control-allow-credentials"] == "true"


# ── invalid origin ────────────────────────────────────────────────────────


async def test_cors_disallowed_origin_get(cors_client: AsyncClient) -> None:
    """GET request from a disallowed origin omits CORS headers."""
    response = await cors_client.get(
        "/api/visualization-data/some-page",
        headers={"Origin": "http://evil.com"},
    )
    assert response.status_code != 500
    assert "access-control-allow-origin" not in response.headers


async def test_cors_disallowed_origin_preflight(cors_client: AsyncClient) -> None:
    """OPTIONS preflight from a disallowed origin is rejected."""
    response = await cors_client.options(
        "/api/visualization-data/some-page",
        headers={
            "Origin": "http://evil.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 400


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
