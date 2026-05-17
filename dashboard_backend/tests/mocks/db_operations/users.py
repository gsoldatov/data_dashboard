"""Raw-SQL test helpers for User entity."""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

from dashboard_backend.src.models.user import User, UserCreate
from dashboard_backend.src.util.passwords import hash_password


class UsersDBOperations:
    """Insert / query users using raw SQL (independent of production repo)."""

    def __init__(self, conn: AsyncConnection) -> None:
        self._conn = conn

    async def insert(self, data: UserCreate) -> User:
        """Insert a user row and return it as a Pydantic User."""
        result = await self._conn.execute(
            text(
                "INSERT INTO users (username, password_hash, role) "
                "VALUES (:username, :password_hash, :role) "
                "RETURNING id, username, role, created_at"
            ).bindparams(
                username=data.username,
                password_hash=hash_password(data.password),
                role=data.role,
            )
        )
        row = result.mappings().one()
        return User.model_validate(row)

    async def by_id(self, user_id: int) -> User | None:
        """Return User by primary key, or None."""
        result = await self._conn.execute(
            text(
                "SELECT id, username, role, created_at "
                "FROM users WHERE id = :id"
            ).bindparams(id=user_id)
        )
        row = result.mappings().one_or_none()
        if row is None:
            return None
        return User.model_validate(row)

    async def by_username(self, username: str) -> User | None:
        """Return User by username, or None."""
        result = await self._conn.execute(
            text(
                "SELECT id, username, role, created_at "
                "FROM users WHERE username = :username"
            ).bindparams(username=username)
        )
        row = result.mappings().one_or_none()
        if row is None:
            return None
        return User.model_validate(row)

    async def by_username_with_hash(
        self, username: str
    ) -> tuple[User, str] | None:
        """Return (User, password_hash) by username, or None."""
        result = await self._conn.execute(
            text(
                "SELECT id, username, password_hash, role, created_at "
                "FROM users WHERE username = :username"
            ).bindparams(username=username)
        )
        row = result.mappings().one_or_none()
        if row is None:
            return None
        return User.model_validate(row), row["password_hash"]
