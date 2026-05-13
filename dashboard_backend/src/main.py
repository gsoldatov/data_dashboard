"""Dashboard backend entry point. Run with `uv run uvicorn main:app` or `python main.py`."""

import sys
from pathlib import Path

# Ensure project root is on sys.path for sibling-package imports
PROJECT_ROOT = Path(__file__).parents[2]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from dashboard_backend.src.app import create_app  # noqa: E402

app = create_app()


if __name__ == "__main__":
    import uvicorn
    from python_common.src.config import get_config
    config = get_config()
    uvicorn.run("main:app", host=config.backend_host, port=config.backend_port, reload=True)
