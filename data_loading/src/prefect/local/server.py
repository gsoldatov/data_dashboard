"""
Runs a local Prefect server
"""
import os
from pathlib import Path

PROJECT_ROOT = Path(__file__).parents[4]
if __name__ == "__main__":
    import sys
    sys.path.insert(0, str(PROJECT_ROOT))

from python_common.src import get_config


def main() -> None:
    config = get_config()

    os.system(
        f'prefect --profile "{config.prefect_profile}" server start '
        f'--host "{config.prefect_server_api_host}" '
        f'--port "{config.prefect_server_api_port}" '
    )


if __name__ == "__main__":
    main()
