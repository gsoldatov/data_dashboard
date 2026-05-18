from collections.abc import AsyncGenerator

from fastapi import Request
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from dashboard_backend.src.db.repository.pages_settings import PagesSettingsRepository
from dashboard_backend.src.db.repository.sessions import SessionsRepository
from dashboard_backend.src.db.repository.users import UsersRepository


class Repository:
    """Unified repository facade exposing per-entity sub-repositories."""
    def __init__(self, session: AsyncSession) -> None:
        self.users = UsersRepository(session)
        self.sessions = SessionsRepository(session)
        self.pages_settings = PagesSettingsRepository(session)


async def get_repo(request: Request) -> AsyncGenerator[Repository]:
    """Yield a Repository bound to a fresh session."""
    engine: AsyncEngine = request.app.state.engine
    async with AsyncSession(engine) as session:
        yield Repository(session)
        await session.commit()
