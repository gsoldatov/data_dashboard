"""Per-entity repository for User operations."""

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from dashboard_backend.src.db.models import Users as UsersModel
from dashboard_backend.src.models.user import User, UserCreate, UserUpdate
from dashboard_backend.src.util.exceptions import NotFoundException, internal_validation
from dashboard_backend.src.util.passwords import hash_password, verify_password


class UsersRepository:
    """Async repository for User entity."""
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    @internal_validation
    async def by_id(self, user_id: int) -> User | None:
        sa_obj = await self._session.get(UsersModel, user_id)
        if sa_obj is None:
            return None
        return User.model_validate(sa_obj)

    @internal_validation
    async def by_credentials(self, username: str, password: str) -> User | None:
        """Return the user if *username* exists and *password* matches."""
        result = await self._session.execute(
            select(UsersModel).where(UsersModel.username == username)
        )
        sa_obj = result.scalar_one_or_none()
        if sa_obj is None:
            return None
        if not verify_password(password, sa_obj.password_hash):
            return None
        return User.model_validate(sa_obj)

    @internal_validation
    async def insert(self, data: UserCreate) -> User:
        """Create a new user from *data*. Password is hashed."""
        sa_obj = UsersModel(
            username=data.username,
            password_hash=hash_password(data.password),
            role=data.role,
        )
        self._session.add(sa_obj)
        await self._session.flush()
        return User.model_validate(sa_obj)

    @internal_validation
    async def update(self, user_id: int, data: UserUpdate) -> User:
        """Update only the non-None fields of an existing user.

        Raises NotFoundException if no user with *user_id* exists.
        """
        sa_obj = await self._session.get(UsersModel, user_id)
        if sa_obj is None:
            raise NotFoundException(f"User {user_id} not found")

        if data.username is not None:
            sa_obj.username = data.username
        if data.password is not None:
            sa_obj.password_hash = hash_password(data.password)
        if data.role is not None:
            sa_obj.role = data.role

        await self._session.flush()
        return User.model_validate(sa_obj)

    async def delete(self, user_id: int) -> None:
        """Delete a user by ID in a single query."""
        await self._session.execute(
            delete(UsersModel).where(UsersModel.id == user_id)
        )
        await self._session.flush()
