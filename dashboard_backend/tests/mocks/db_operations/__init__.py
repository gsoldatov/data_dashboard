"""DB operations facade — raw-SQL helpers for test database manipulation."""

from sqlalchemy.ext.asyncio import AsyncConnection

from dashboard_backend.tests.mocks.db_operations.pages_settings import (
    PagesSettingsDBOperations,
)
from dashboard_backend.tests.mocks.db_operations.sessions import SessionsDBOperations
from dashboard_backend.tests.mocks.db_operations.users import UsersDBOperations


class DBOperations:
    """Facade exposing per-entity raw-SQL test helpers."""
    def __init__(self, conn: AsyncConnection) -> None:
        self.users = UsersDBOperations(conn)
        self.sessions = SessionsDBOperations(conn)
        self.pages_settings = PagesSettingsDBOperations(conn)
