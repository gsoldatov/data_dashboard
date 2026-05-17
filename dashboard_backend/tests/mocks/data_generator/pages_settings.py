"""Test-data generator for PageSettings entity."""

from dashboard_backend.src.models.page_settings import PageSettings, PageSettingsUpsert


class PagesSettingsDataGenerator:
    """Generate valid PageSettings Pydantic objects with overridable defaults."""

    def page_settings_upsert(
        self,
        slug: str = "test-page",
        is_published: bool = True,
    ) -> PageSettingsUpsert:
        return PageSettingsUpsert(slug=slug, is_published=is_published)

    def page_settings(
        self,
        id: int = 1,
        slug: str = "test-page",
        is_published: bool = True,
    ) -> PageSettings:
        return PageSettings(id=id, slug=slug, is_published=is_published)
