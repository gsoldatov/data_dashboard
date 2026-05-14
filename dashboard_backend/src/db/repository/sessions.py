"""Per-entity repository for Session operations."""

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from dashboard_backend.src.db.models import Sessions as SessionsModel


class SessionsRepository:
    """Async repository for Session entity."""
    # TODO
    # - session prolongation
    # ? remove rowcount
    # ? use corresponding Pydantic models when creating / inserting

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def by_token(self, token: str) -> SessionsModel | None:
        result = await self._session.execute(
            select(SessionsModel).where(SessionsModel.token == token)
        )
        return result.scalar_one_or_none()

    async def create(self, session: SessionsModel) -> SessionsModel:
        self._session.add(session)
        await self._session.flush()
        return session

    async def delete(self, token: str) -> None:
        await self._session.execute(
            delete(SessionsModel).where(SessionsModel.token == token)
        )
        await self._session.flush()

    async def delete_expired(self) -> int:
        """Delete all sessions past their expiry. Returns count of deleted rows."""
        result = await self._session.execute(
            delete(SessionsModel).where(
                SessionsModel.expires_at < datetime.now(timezone.utc)
            )
        )
        await self._session.flush()
        return result.rowcount
