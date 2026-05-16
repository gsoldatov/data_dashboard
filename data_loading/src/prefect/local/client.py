"""
Runs a local Prefect worker client
(a simpler alternative to process work pools,
which directly deploys & executes on schedule all flows;
still requires a running Prefect server)
"""
from datetime import timedelta
from pathlib import Path
from typing import Any

from prefect import serve
from prefect.context import use_profile

PROJECT_ROOT = Path(__file__).parents[4]
if __name__ == "__main__":
    import sys
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.jobs import russia_state_budget
from python_common.src import get_config


def main() -> None:
    config = get_config()

    with use_profile(config.prefect_profile):
        deployments: list[Any] = [
            russia_state_budget.to_deployment(
                "Russia state budget",
                interval=timedelta(weeks=1)
            )
        ]

        # Run Prefect server
        serve(*deployments)


if __name__ == "__main__":
    main()
