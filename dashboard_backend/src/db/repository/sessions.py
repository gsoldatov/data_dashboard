"""Per-entity repository for Session operations."""

import secrets
from datetime import datetime, timezone, timedelta

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, and_

from dashboard_backend.src.db.models import Sessions as SessionsModel
from dashboard_backend.src.models.session import Session
from dashboard_backend.src.util.exceptions import NotFoundException


class SessionsRepository:
    """Async repository for Session entity."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def by_token(self, token: str) -> Session | None:
        result = await self._session.execute(
            select(SessionsModel).where(and_(
                SessionsModel.token == token,
                SessionsModel.expires_at >= datetime.now(timezone.utc)
            ))
        )
        sa_obj = result.scalar_one_or_none()
        if sa_obj is None:
            return None
        return Session.model_validate(sa_obj)

    async def create(self, user_id: int, ttl_seconds: int) -> Session:
        """Create a new session for *user_id* and return it."""
        token = secrets.token_hex(32)
        sa_session = SessionsModel(
            user_id=user_id,
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(seconds=ttl_seconds),
        )
        self._session.add(sa_session)
        await self._session.flush()
        return Session.model_validate(sa_session)

    async def prolong(self, session: Session, new_expires_at: datetime) -> None:
        """Update session's expiration time."""
        sa_session = await self._session.get(SessionsModel, session.id)
        if sa_session is None:
            raise NotFoundException
        sa_session.expires_at = new_expires_at
        await self._session.flush()

    async def delete(self, token: str) -> None:
        await self._session.execute(
            delete(SessionsModel).where(SessionsModel.token == token)
        )
        await self._session.flush()

    async def delete_expired(self) -> None:
        """Delete all sessions past their expiry."""
        await self._session.execute(
            delete(SessionsModel).where(
                SessionsModel.expires_at < datetime.now(timezone.utc)
            )
        )
        await self._session.flush()
