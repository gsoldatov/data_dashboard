"""Test-data generator for VisualizationSettings entity."""

from dashboard_backend.src.models.visualization_settings import (
    VisualizationSettings,
    VisualizationSettingsUpsert,
)


class VisualizationsSettingsDataGenerator:
    """Generate valid VisualizationSettings Pydantic objects
    with overridable defaults."""

    def visualization_settings_upsert(
        self,
        is_published: bool = True,
    ) -> VisualizationSettingsUpsert:
        return VisualizationSettingsUpsert(is_published=is_published)

    def visualization_settings(
        self,
        id: int = 1,
        slug: str = "test-visualization",
        is_published: bool = True,
    ) -> VisualizationSettings:
        return VisualizationSettings(
            id=id, slug=slug, is_published=is_published
        )
