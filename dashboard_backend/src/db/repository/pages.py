"""Per-entity repository for Page operations."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from dashboard_backend.src.db.models import Page as PageModel


class PagesRepository:
    """Async repository for Page entity."""
    # TODO
    # ? use corresponding Pydantic models when creating / inserting
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def by_id(self, page_id: int) -> PageModel | None:
        return await self._session.get(PageModel, page_id)

    async def by_slug(self, slug: str) -> PageModel | None:
        result = await self._session.execute(
            select(PageModel).where(PageModel.slug == slug)
        )
        return result.scalar_one_or_none()

    async def list_all(self) -> list[PageModel]:
        result = await self._session.execute(select(PageModel))
        return list(result.scalars().all())

    async def list_published(self) -> list[PageModel]:
        result = await self._session.execute(
            select(PageModel).where(PageModel.is_published)
        )
        return list(result.scalars().all())

    async def insert(self, page: PageModel) -> PageModel:
        self._session.add(page)
        await self._session.flush()
        return page

    async def update(self, page: PageModel) -> PageModel:
        await self._session.flush()
        return page

    async def delete(self, page_id: int) -> None:
        page = await self.by_id(page_id)
        if page is not None:
            await self._session.delete(page)
            await self._session.flush()
