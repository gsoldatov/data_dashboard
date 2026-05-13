"""Per-entity repository for User operations."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from dashboard_backend.src.db.models import User as UserModel


class UsersRepository:
    """Async repository for User entity."""
    # TODO
    # - add by_session_token method;    <- get user & session in one query
    # ? use corresponding Pydantic models when creating / inserting
    
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def by_id(self, user_id: int) -> UserModel | None:
        return await self._session.get(UserModel, user_id)

    async def by_username(self, username: str) -> UserModel | None:
        result = await self._session.execute(
            select(UserModel).where(UserModel.username == username)
        )
        return result.scalar_one_or_none()

    async def insert(self, user: UserModel) -> UserModel:
        self._session.add(user)
        await self._session.flush()
        return user

    async def update(self, user: UserModel) -> UserModel:
        await self._session.flush()
        return user

    async def delete(self, user_id: int) -> None:
        user = await self.by_id(user_id)
        if user is not None:
            await self._session.delete(user)
            await self._session.flush()
