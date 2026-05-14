"""Per-entity repository for Session operations."""

from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_

from dashboard_backend.src.db.models import Sessions as SessionsModel
from dashboard_backend.src.models.session import Session as PydanticSession


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
            select(SessionsModel).where(and_(
                SessionsModel.token == token,
                SessionsModel.expires_at >= datetime.now(timezone.utc)
            ))
        )
        return result.scalar_one_or_none()

    async def create(self, session: SessionsModel) -> SessionsModel:
        self._session.add(session)
        await self._session.flush()
        return session

    async def prolong(self, session: PydanticSession, new_expires_at: datetime) -> None:
        """Update a session's expiration time without re-fetching from the DB.

        Uses the ORM identity map to retrieve the already-loaded SA object.
        """
        sa_session = await self._session.get(SessionsModel, session.id)
        if sa_session is not None:
            sa_session.expires_at = new_expires_at
            await self._session.flush()

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
