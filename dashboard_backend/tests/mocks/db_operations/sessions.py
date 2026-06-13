"""Raw-SQL test helpers for Session entity."""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

from dashboard_backend.src.models.session import Session


class SessionsDBOperations:
    """Insert / query sessions using raw SQL (independent of production repo)."""

    def __init__(self, conn: AsyncConnection) -> None:
        self._conn = conn

    async def insert(self, session: Session) -> Session:
        """Insert a session row and return it."""
        result = await self._conn.execute(
            text(
                "INSERT INTO sessions (user_id, token, expires_at) "
                "VALUES (:user_id, :token, :expires_at) "
                "RETURNING id, user_id, token, expires_at, created_at"
            ).bindparams(
                user_id=session.user_id,
                token=session.token,
                expires_at=session.expires_at,
            )
        )
        row = result.mappings().one()
        return Session.model_validate(row)

    async def by_token(self, token: str) -> Session | None:
        """Return a non-expired session by token, or None."""
        result = await self._conn.execute(
            text(
                "SELECT id, user_id, token, expires_at, created_at "
                "FROM sessions WHERE token = :token"
            ).bindparams(token=token)
        )
        row = result.mappings().one_or_none()
        if row is None:
            return None
        return Session.model_validate(row)

    async def get_user_sessions(self, user_id: int) -> list[Session]:
        """Return all sessions for *user_id* (including expired)."""
        result = await self._conn.execute(
            text(
                "SELECT id, user_id, token, expires_at, created_at "
                "FROM sessions WHERE user_id = :user_id"
            ).bindparams(user_id=user_id)
        )
        return [Session.model_validate(row) for row in result.mappings().all()]
