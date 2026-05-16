"""
Utilities for mock HTTP server
"""
import time
from collections.abc import Generator

from pytest_httpserver import HTTPServer
from werkzeug.wrappers import Request, Response


def create_success_endpoint(server: HTTPServer, content: str = "test content", 
                          status_code: int = 200) -> str:
    """
    Create a successful endpoint on the mock server.
    
    Args:
        server: The HTTPServer instance
        content: The content to return
        status_code: HTTP status code to return
        
    Returns:
        The URL for the endpoint
    """
    server.expect_request("/test").respond_with_data(
        content, status=status_code, content_type="text/plain"
    )
    return server.url_for("/test")


def create_error_endpoint(server: HTTPServer, status_code: int = 404) -> str:
    """
    create an error endpoint on the mock server.
    
    Args:
        server: The HTTPServer instance
        status_code: HTTP status code to return
        
    Returns:
        The URL for the endpoint
    """
    server.expect_request("/error").respond_with_data(
        f"Error {status_code}", status=status_code, content_type="text/plain"
    )
    return server.url_for("/error")


def create_streaming_endpoint(
    server: HTTPServer, 
    chunks: list[bytes] | list[str],
    delay: float = 0.0
) -> str:
    """
    Create a streaming endpoint that yields provided chunks with delay.
    
    Args:
        server: The HTTPServer instance
        chunks: List of string or byte chunks to yield
        delay: Delay in seconds between chunks
        
    Returns:
        The URL for the endpoint
    """
    def streaming_handler(request: Request) -> Response:
        def generate_chunks() -> Generator[bytes]:
            for chunk in chunks:
                if isinstance(chunk, str):
                    yield chunk.encode()
                else:
                    yield chunk
                if delay > 0:
                    time.sleep(delay)
        
        return Response(
            generate_chunks(),
            mimetype='application/octet-stream',
            direct_passthrough=True
        )
    
    server.expect_request("/stream").respond_with_handler(streaming_handler)
    return server.url_for("/stream")
