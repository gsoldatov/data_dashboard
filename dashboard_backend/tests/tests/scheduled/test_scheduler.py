"""Test cases for scheduled expired session cleanup."""

import sys
from pathlib import Path

import pytest

# Support direct file execution
PROJECT_ROOT = Path(__file__).parents[4]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from apscheduler.triggers.interval import IntervalTrigger
from fastapi import FastAPI

from python_common.src.config import Config


async def test_scheduler_is_configured(
    test_app: FastAPI,
    test_config: Config,
) -> None:
    """Lifespan registers an AsyncIOScheduler with the cleanup job."""
    async with test_app.router.lifespan_context(test_app):
        scheduler = test_app.state.scheduler
        assert scheduler is not None

        jobs = scheduler.get_jobs()
        assert len(jobs) == 1
        job = jobs[0]
        assert isinstance(job.trigger, IntervalTrigger)
        assert job.trigger.interval_length == float(
            test_config.backend_expired_sessions_cleanup_interval
        )


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
