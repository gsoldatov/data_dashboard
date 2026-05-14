"""Per-entity repository for page settings operations."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from dashboard_backend.src.db.models import PagesSettings
from dashboard_backend.src.models.page_settings import PageSettings, PageSettingsUpsert


class PagesSettingsRepository:
    """Async repository for page settings entity."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def by_slug(self, slug: str) -> PageSettings | None:
        result = await self._session.execute(
            select(PagesSettings).where(PagesSettings.slug == slug)
        )
        sa_obj = result.scalar_one_or_none()
        if sa_obj is None:
            return None
        return PageSettings.model_validate(sa_obj)

    async def list_all(self) -> list[PageSettings]:
        result = await self._session.execute(select(PagesSettings))
        return [PageSettings.model_validate(obj) for obj in result.scalars().all()]

    async def list_published(self) -> list[PageSettings]:
        result = await self._session.execute(
            select(PagesSettings).where(PagesSettings.is_published)
        )
        return [PageSettings.model_validate(obj) for obj in result.scalars().all()]

    async def upsert(self, data: PageSettingsUpsert) -> PageSettings:
        """Insert or update page settings by slug."""
        existing = await self._session.execute(
            select(PagesSettings).where(PagesSettings.slug == data.slug)
        )
        sa_obj = existing.scalar_one_or_none()

        if sa_obj is None:
            sa_obj = PagesSettings(slug=data.slug, is_published=data.is_published)
            self._session.add(sa_obj)
        else:
            sa_obj.is_published = data.is_published

        await self._session.flush()
        return PageSettings.model_validate(sa_obj)
