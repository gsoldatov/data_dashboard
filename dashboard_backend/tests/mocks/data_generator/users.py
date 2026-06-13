"""Test-data generator for User entity."""

from datetime import UTC, datetime

from dashboard_backend.src.models.user import (
    User,
    UserCreate,
    UserResponse,
    UserRole,
    UserUpdate,
)


class UsersDataGenerator:
    """Generate valid User Pydantic objects with overridable defaults."""

    def user_create(
        self,
        username: str = "test_user",
        password: str = "test_password",
        role: UserRole = "viewer",
    ) -> UserCreate:
        return UserCreate(username=username, password=password, role=role)

    def user_update(
        self,
        current_user_password: str = "current_pass",
        username: str | None = "updated_user",
        password: str | None = None,
        role: UserRole | None = "admin",
    ) -> UserUpdate:
        return UserUpdate(
            current_user_password=current_user_password,
            username=username,
            password=password,
            role=role,
        )

    def user_response(
        self,
        id: int = 1,
        username: str = "test_user",
        role: str = "viewer",
        created_at: datetime = datetime(2026, 1, 1, tzinfo=UTC),
    ) -> UserResponse:
        return UserResponse(id=id, username=username, role=role, created_at=created_at)

    def user(
        self,
        id: int = 1,
        username: str = "test_user",
        role: str = "viewer",
        created_at: datetime = datetime(2026, 1, 1, tzinfo=UTC),
    ) -> User:
        return User(id=id, username=username, role=role, created_at=created_at)
