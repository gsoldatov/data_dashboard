"""
Test configuration and fixtures for data_loading tests
"""
import sys
from collections.abc import Generator
from pathlib import Path

import pytest
from pytest_httpserver import HTTPServer

# Add project root to sys.path to allow absolute imports in test files
PROJECT_ROOT = Path(__file__).parents[2]
sys.path.insert(0, str(PROJECT_ROOT))

from python_common.tests.shared_fixtures import create_temp_directory

_TESTS_DIR = Path(__file__).parent


@pytest.fixture
def temp_directory(request: pytest.FixtureRequest) -> Path:
    """
    Create a temporary directory for tests.

    The directory follows the pattern:
        data_loading/tests/temp/<test_case_name>_<random_uuid>
    Existing directories for the same test case are cleaned before creating new ones.
    The directory is not deleted after the test so its contents can be inspected.
    """
    return create_temp_directory(_TESTS_DIR, request.node.name)


@pytest.fixture
def mock_http_server() -> Generator[HTTPServer]:
    """
    Fixture that provides a pytest-httpserver instance.
    The server is automatically started and stopped.
    """
    server = HTTPServer()
    server.start()
    yield server
    server.clear()
    server.stop()
