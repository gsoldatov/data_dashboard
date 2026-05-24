"""Raw-SQL test helpers for VisualizationSettings entity."""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

from dashboard_backend.src.models.visualization_settings import (
    VisualizationSettings,
)


class VisualizationsSettingsDBOperations:
    """Insert / query visualization settings using raw SQL."""

    def __init__(self, conn: AsyncConnection) -> None:
        self._conn = conn

    async def insert(
        self, data: VisualizationSettings
    ) -> VisualizationSettings:
        """Insert a visualization_settings row and return it."""
        result = await self._conn.execute(
            text(
                "INSERT INTO visualization_settings (slug, is_published) "
                "VALUES (:slug, :is_published) "
                "RETURNING id, slug, is_published"
            ).bindparams(slug=data.slug, is_published=data.is_published)
        )
        row = result.mappings().one()
        return VisualizationSettings.model_validate(row)

    async def by_slug(self, slug: str) -> VisualizationSettings | None:
        """Return visualization settings by slug, or None."""
        result = await self._conn.execute(
            text(
                "SELECT id, slug, is_published "
                "FROM visualization_settings WHERE slug = :slug"
            ).bindparams(slug=slug)
        )
        row = result.mappings().one_or_none()
        if row is None:
            return None
        return VisualizationSettings.model_validate(row)

    async def list_all(self) -> list[VisualizationSettings]:
        """Return all visualization settings rows."""
        result = await self._conn.execute(
            text(
                "SELECT id, slug, is_published "
                "FROM visualization_settings"
            )
        )
        return [
            VisualizationSettings.model_validate(r)
            for r in result.mappings().all()
        ]
