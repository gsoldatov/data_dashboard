"""Raw-SQL test helpers for PageSettings entity."""

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncConnection

from dashboard_backend.src.models.page_settings import PageSettings


class PagesSettingsDBOperations:
    """Insert / query page settings using raw SQL."""

    def __init__(self, conn: AsyncConnection) -> None:
        self._conn = conn

    async def insert(self, data: PageSettings) -> PageSettings:
        """Insert a page_settings row and return it."""
        result = await self._conn.execute(
            text(
                "INSERT INTO page_settings (slug, is_published) "
                "VALUES (:slug, :is_published) "
                "RETURNING id, slug, is_published"
            ).bindparams(slug=data.slug, is_published=data.is_published)
        )
        row = result.mappings().one()
        return PageSettings.model_validate(row)

    async def by_slug(self, slug: str) -> PageSettings | None:
        """Return page settings by slug, or None."""
        result = await self._conn.execute(
            text(
                "SELECT id, slug, is_published "
                "FROM page_settings WHERE slug = :slug"
            ).bindparams(slug=slug)
        )
        row = result.mappings().one_or_none()
        if row is None:
            return None
        return PageSettings.model_validate(row)

    async def list_all(self) -> list[PageSettings]:
        """Return all page settings rows."""
        result = await self._conn.execute(
            text("SELECT id, slug, is_published FROM page_settings")
        )
        return [PageSettings.model_validate(r) for r in result.mappings().all()]
