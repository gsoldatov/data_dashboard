"""Data generator facade — provides factory methods for test data."""

from dashboard_backend.tests.mocks.data_generator.pages_settings import (
    PagesSettingsDataGenerator,
)
from dashboard_backend.tests.mocks.data_generator.sessions import (
    SessionsDataGenerator,
)
from dashboard_backend.tests.mocks.data_generator.users import UsersDataGenerator


class DataGenerator:
    """Facade exposing per-entity test-data generators."""
    def __init__(self) -> None:
        self.users = UsersDataGenerator()
        self.sessions = SessionsDataGenerator()
        self.pages_settings = PagesSettingsDataGenerator()
