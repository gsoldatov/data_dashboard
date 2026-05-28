"""Test-data generator for Session entity."""

from datetime import UTC, datetime, timedelta

from dashboard_backend.src.models.session import LoginRequest, Session


class SessionsDataGenerator:
    """Generate valid Session Pydantic objects with overridable defaults."""

    def login_request(
        self,
        username: str = "test_user",
        password: str = "test_password",
    ) -> LoginRequest:
        return LoginRequest(username=username, password=password)

    def session(
        self,
        id: int = 1,
        user_id: int = 1,
        token: str = "a" * 64,
        expires_at: datetime | None = None,
        created_at: datetime | None = None,
    ) -> Session:
        now = datetime.now(UTC)
        if expires_at is None:
            expires_at = now + timedelta(hours=1)
        if created_at is None:
            created_at = now
        return Session(
            id=id,
            user_id=user_id,
            token=token,
            expires_at=expires_at,
            created_at=created_at,
        )
