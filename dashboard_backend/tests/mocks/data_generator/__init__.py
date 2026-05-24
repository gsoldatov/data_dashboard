"""Data generator facade — provides factory methods for test data."""

from dashboard_backend.tests.mocks.data_generator.sessions import (
    SessionsDataGenerator,
)
from dashboard_backend.tests.mocks.data_generator.users import UsersDataGenerator
from dashboard_backend.tests.mocks.data_generator.visualization_settings import (
    VisualizationsSettingsDataGenerator,
)


class DataGenerator:
    """Facade exposing per-entity test-data generators."""
    def __init__(self) -> None:
        self.users = UsersDataGenerator()
        self.sessions = SessionsDataGenerator()
        self.visualization_settings = VisualizationsSettingsDataGenerator()
