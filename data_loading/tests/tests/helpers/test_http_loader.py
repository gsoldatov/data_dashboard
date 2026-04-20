"""
Test cases for HTTPLoader class
"""
import sys

import httpx
import pytest
from pytest_httpserver import HTTPServer

from pathlib import Path

# Add project root to path so we can import the module
PROJECT_ROOT = Path(__file__).parents[4]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.helpers.http_loader import HTTPLoader
from data_loading.tests.mocks.http_server import (
    create_success_endpoint,
    create_error_endpoint,
    create_streaming_endpoint
)


def test_load_file_invalid_url(temp_directory: Path) -> None:
    """Test that invalid URLs raise appropriate exceptions"""
    # Arrange
    url = "not-a-valid-url"
    save_path = temp_directory / "test_file.txt"
    
    loader = HTTPLoader(url=url, save_path=save_path)
    
    # Act & Assert
    with pytest.raises(httpx.UnsupportedProtocol):
        loader.load_file()


def test_load_file_connection_error(temp_directory: Path) -> None:
    """Test that connection errors are handled properly"""
    # Arrange
    # Use a URL that definitely won't connect
    url = "http://localhost:99999/nonexistent"
    save_path = temp_directory / "test_file.txt"
    
    loader = HTTPLoader(url=url, save_path=save_path)
    
    # Act & Assert
    with pytest.raises(httpx.ConnectError):
        loader.load_file()


def test_load_file_http_error_404(
    temp_directory: Path,
    mock_http_server: HTTPServer
) -> None:
    """Test that HTTP 404 raises appropriate exception"""
    # Arrange
    url = create_error_endpoint(mock_http_server, 404)
    save_path = temp_directory / "test_file.txt"
    
    loader = HTTPLoader(url=url, save_path=save_path)
    
    # Act & Assert
    with pytest.raises(httpx.HTTPStatusError) as exc_info:
        loader.load_file()
    
    assert exc_info.value.response.status_code == 404


def test_load_file_http_error_500(
    temp_directory: Path,
    mock_http_server: HTTPServer
) -> None:
    """Test that HTTP 500 raises appropriate exception"""
    # Arrange
    url = create_error_endpoint(mock_http_server, 500)
    save_path = temp_directory / "test_file.txt"
    
    loader = HTTPLoader(url=url, save_path=save_path)
    
    # Act & Assert
    with pytest.raises(httpx.HTTPStatusError) as exc_info:
        loader.load_file()
    
    assert exc_info.value.response.status_code == 500


def test_load_file_creates_directories(
    temp_directory: Path,
    mock_http_server: HTTPServer
) -> None:
    """Test that HTTPLoader works when directories are pre-created"""
    # Arrange
    test_content = "test content"
    url = create_success_endpoint(mock_http_server, test_content, 200)
    # Use a save path that includes non-existent directories
    save_path = temp_directory / "deeply" / "nested" / "directory" / "file.txt"
    
    # Create directories first (as shown in the fetch_page.py example)
    save_path.parent.mkdir(parents=True, exist_ok=True)
    
    loader = HTTPLoader(url=url, save_path=save_path)
    
    # Act
    loader.load_file()
    
    # Assert
    assert save_path.exists()
    assert save_path.read_text() == test_content
    # Check that all intermediate directories exist
    assert save_path.parent.exists()
    assert save_path.parent.parent.exists()
    assert save_path.parent.parent.parent.exists()


def test_load_file_success(
    temp_directory: Path,
    mock_http_server: HTTPServer
) -> None:
    """Test successful file download and save"""
    # Arrange
    test_content = "This is test content for the file"
    url = create_success_endpoint(mock_http_server, test_content, 200)
    save_path = temp_directory / "test_file.txt"
    
    loader = HTTPLoader(url=url, save_path=save_path)
    
    # Act
    loader.load_file()
    
    # Assert
    assert save_path.exists()
    assert save_path.read_text() == test_content


def test_load_file_large_content(
    temp_directory: Path, 
    mock_http_server: HTTPServer
) -> None:
    """Test downloading larger content"""
    # Arrange
    # Create larger content (10KB)
    test_content = "A" * 10240  # 10KB of 'A' characters
    url = create_success_endpoint(mock_http_server, test_content, 200)
    save_path = temp_directory / "large_file.txt"
    
    loader = HTTPLoader(url=url, save_path=save_path)
    
    # Act
    loader.load_file()
    
    # Assert
    assert save_path.exists()
    assert save_path.read_text() == test_content
    assert save_path.stat().st_size == len(test_content)


def test_load_file_empty_content(
    temp_directory: Path,
    mock_http_server: HTTPServer
) -> None:
    """Test downloading empty content"""
    # Arrange
    test_content = ""
    url = create_success_endpoint(mock_http_server, test_content, 200)
    save_path = temp_directory / "empty_file.txt"
    
    loader = HTTPLoader(url=url, save_path=save_path)
    
    # Act
    loader.load_file()
    
    # Assert
    assert save_path.exists()
    assert save_path.read_text() == test_content
    assert save_path.stat().st_size == 0


def test_load_file_streaming_disconnect(
    temp_directory: Path,
    mock_http_server: HTTPServer
) -> None:
    """Test disconnect during download using short Timeout."""
    # Arrange
    chunks = ["a", "b", "c"]
    url = create_streaming_endpoint(mock_http_server, chunks, delay=0.1)
    save_path = temp_directory / "streaming_disconnect.txt"
    
    # Use very short timeout to simulate quick disconnect
    timeout = httpx.Timeout(0.05)  # 50ms timeout
    loader = HTTPLoader(url=url, save_path=save_path, timeout=timeout)
    
    # Act & Assert
    with pytest.raises((httpx.ReadTimeout, httpx.PoolTimeout)):
        loader.load_file()


def test_load_file_streaming_success(
    temp_directory: Path,
    mock_http_server: HTTPServer
) -> None:
    """Test successful download of streaming content."""
    # Arrange
    chunks = ["chunk1-data-", "chunk2-data-", "chunk3-data-"]
    url = create_streaming_endpoint(mock_http_server, chunks, delay=0.001)
    save_path = temp_directory / "streaming_file.txt"
    
    loader = HTTPLoader(url=url, save_path=save_path)
    
    # Act
    loader.load_file()
    
    # Assert
    assert save_path.exists()
    content = save_path.read_bytes().decode()
    expected_content = "".join(chunks)
    assert content == expected_content


# Make the file executable if run directly
if __name__ == "__main__":
    pytest.main([__file__, "-v"])
