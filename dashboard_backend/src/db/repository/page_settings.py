"""Per-entity repository for PageSettings operations."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from dashboard_backend.src.db.models import PageSettings as PageSettingsModel


class PageSettingsRepository:
    """Async repository for PageSettings entity."""
    # TODO
    # ? use corresponding Pydantic models when creating / inserting
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def by_id(self, page_id: int) -> PageSettingsModel | None:
        return await self._session.get(PageSettingsModel, page_id)

    async def by_slug(self, slug: str) -> PageSettingsModel | None:
        result = await self._session.execute(
            select(PageSettingsModel).where(PageSettingsModel.slug == slug)
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> list[PageSettingsModel]:
        result = await self._session.execute(select(PageSettingsModel))
        return list(result.scalars().all())

    async def list_published(self) -> list[PageSettingsModel]:
        result = await self._session.execute(
            select(PageSettingsModel).where(PageSettingsModel.is_published)
        )
        return list(result.scalars().all())

    async def insert(self, page: PageSettingsModel) -> PageSettingsModel:
        self._session.add(page)
        await self._session.flush()
        return page

    async def update(self, page: PageSettingsModel) -> PageSettingsModel:
        await self._session.flush()
        return page

    async def delete(self, page_id: int) -> None:
        page = await self.by_id(page_id)
        if page is not None:
            await self._session.delete(page)
            await self._session.flush()
