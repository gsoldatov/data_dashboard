from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI

from dashboard_backend.src.scheduled.cleanup_expired_sessions import (
    cleanup_expired_sessions,
)


def setup_scheduler(app: FastAPI) -> AsyncIOScheduler:
    """Create, configure, and start the session-cleanup scheduler."""
    scheduler = AsyncIOScheduler()
    scheduler.add_job(
        cleanup_expired_sessions,
        "interval",
        seconds=app.state.config.backend_expired_sessions_cleanup_interval,
        args=[app.state.engine],
    )
    scheduler.start()
    return scheduler


__all__ = ["cleanup_expired_sessions", "setup_scheduler"]
