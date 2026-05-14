"""Per-entity repository for page settings operations."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from dashboard_backend.src.db.models import PagesSettings as PagesSettingsModel


class PagesSettingsRepository:
    """Async repository for page settings entity."""
    # TODO
    # ? use corresponding Pydantic models when creating / inserting
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def by_id(self, page_id: int) -> PagesSettingsModel | None:
        return await self._session.get(PagesSettingsModel, page_id)

    async def by_slug(self, slug: str) -> PagesSettingsModel | None:
        result = await self._session.execute(
            select(PagesSettingsModel).where(PagesSettingsModel.slug == slug)
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> list[PagesSettingsModel]:
        result = await self._session.execute(select(PagesSettingsModel))
        return list(result.scalars().all())

    async def list_published(self) -> list[PagesSettingsModel]:
        result = await self._session.execute(
            select(PagesSettingsModel).where(PagesSettingsModel.is_published)
        )
        return list(result.scalars().all())

    async def insert(self, page: PagesSettingsModel) -> PagesSettingsModel:
        self._session.add(page)
        await self._session.flush()
        return page

    async def update(self, page: PagesSettingsModel) -> PagesSettingsModel:
        await self._session.flush()
        return page

    async def delete(self, page_id: int) -> None:
        page = await self.by_id(page_id)
        if page is not None:
            await self._session.delete(page)
            await self._session.flush()
