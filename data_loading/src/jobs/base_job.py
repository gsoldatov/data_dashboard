from prefect import flow

from python_common.src import Settings


class BaseJob:
    def __init__(
        self,
        settings: Settings
    ) -> None:
        self.settings = settings

    async def _run(self) -> None:
        raise NotImplementedError

    @flow
    async def run(self) -> None:
        await self._run()
