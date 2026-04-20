"""
Test configuration and fixtures for data_loading tests
"""
import pytest
import shutil
import sys
import uuid

from pathlib import Path
from pytest_httpserver import HTTPServer
from typing import Generator

# Add project root to sys.path to allow absolute imports in test files
PROJECT_ROOT = Path(__file__).parents[2]
sys.path.insert(0, str(PROJECT_ROOT))


@pytest.fixture
def temp_directory(request) -> Path:
    """
    Create a temporary directory for tests.
    
    The directory follows the pattern: data_loading/tests/temp/<test_case_name>_<random_uuid>
    Existing directories for the same test case are cleaned before creating new ones.
    The directory is not deleted after the test so its contents can be inspected.
    
    Args:
        request: pytest fixture request object to get test name
        
    Returns:
        Path: Path to the created temporary directory
    """
    # Get the test function name
    test_name = request.node.name
    
    # Create base temp directory if it doesn't exist
    base_temp_dir = Path(__file__).parent / "temp"
    base_temp_dir.mkdir(exist_ok=True)
    
    # Create unique directory name
    unique_id = str(uuid.uuid4())[:8]  # Use first 8 chars of UUID
    dir_name = f"{test_name}_{unique_id}"
    temp_dir = base_temp_dir / dir_name
    
    # Clean existing directories for the same test case
    # (those with the same test name prefix)
    for existing_dir in base_temp_dir.glob(f"{test_name}_*"):
        if existing_dir.is_dir():
            shutil.rmtree(existing_dir)
    
    # Create the new directory
    temp_dir.mkdir(parents=True, exist_ok=True)
    
    return temp_dir


@pytest.fixture
def mock_http_server() -> Generator[HTTPServer, None, None]:
    """
    Fixture that provides a pytest-httpserver instance.
    The server is automatically started and stopped.
    """
    server = HTTPServer()
    server.start()
    yield server
    server.clear()
    server.stop()
