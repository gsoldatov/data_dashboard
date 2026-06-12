"""Per-entity repository for visualization settings operations."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from dashboard_backend.src.db.models import VisualizationsSettings
from dashboard_backend.src.models.visualization_settings import (
    VisualizationSettings,
    VisualizationSettingsUpsert,
)
from dashboard_backend.src.util.exceptions import internal_validation


class VisualizationsSettingsRepository:
    """Async repository for visualization settings entity."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    @internal_validation
    async def by_slug(self, slug: str) -> VisualizationSettings | None:
        result = await self._session.execute(
            select(VisualizationsSettings).where(
                VisualizationsSettings.slug == slug
            )
        )
        sa_obj = result.scalar_one_or_none()
        if sa_obj is None:
            return None
        return VisualizationSettings.model_validate(sa_obj)

    @internal_validation
    async def by_slugs(self, slugs: list[str]) -> list[VisualizationSettings]:
        """Return stored settings for the given slugs (single query)."""
        if not slugs:
            return []
        result = await self._session.execute(
            select(VisualizationsSettings).where(
                VisualizationsSettings.slug.in_(slugs)
            )
        )
        return [
            VisualizationSettings.model_validate(obj)
            for obj in result.scalars().all()
        ]

    @internal_validation
    async def list_all(self) -> list[VisualizationSettings]:
        result = await self._session.execute(select(VisualizationsSettings))
        return [
            VisualizationSettings.model_validate(obj)
            for obj in result.scalars().all()
        ]

    @internal_validation
    async def list_published(self) -> list[VisualizationSettings]:
        result = await self._session.execute(
            select(VisualizationsSettings).where(
                VisualizationsSettings.is_published
            )
        )
        return [
            VisualizationSettings.model_validate(obj)
            for obj in result.scalars().all()
        ]

    @internal_validation
    async def upsert(
        self, slug: str, data: VisualizationSettingsUpsert
    ) -> VisualizationSettings:
        """Insert or update visualization settings by slug."""
        existing = await self._session.execute(
            select(VisualizationsSettings).where(
                VisualizationsSettings.slug == slug
            )
        )
        sa_obj = existing.scalar_one_or_none()

        if sa_obj is None:
            sa_obj = VisualizationsSettings(
                slug=slug, is_published=data.is_published
            )
            self._session.add(sa_obj)
        else:
            sa_obj.is_published = data.is_published

        await self._session.flush()
        return VisualizationSettings.model_validate(sa_obj)
