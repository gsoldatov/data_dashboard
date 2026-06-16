from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession

from dashboard_backend.src.db.repository import Repository


async def cleanup_expired_sessions(engine: AsyncEngine) -> None:
    """Delete all expired sessions from the database."""
    async with AsyncSession(engine) as session:
        repo = Repository(session)
        await repo.sessions.delete_expired()
        await session.commit()
