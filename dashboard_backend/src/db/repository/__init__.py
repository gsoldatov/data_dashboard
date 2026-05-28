from sqlalchemy.ext.asyncio import AsyncSession

from dashboard_backend.src.db.repository.sessions import SessionsRepository
from dashboard_backend.src.db.repository.users import UsersRepository
from dashboard_backend.src.db.repository.visualizations_settings import (
    VisualizationsSettingsRepository,
)


class Repository:
    """Unified repository facade exposing per-entity sub-repositories."""
    def __init__(self, session: AsyncSession) -> None:
        self.users = UsersRepository(session)
        self.sessions = SessionsRepository(session)
        self.visualizations_settings = VisualizationsSettingsRepository(session)
