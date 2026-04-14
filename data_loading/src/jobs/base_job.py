from prefect import flow

from python_common.src import Config


class BaseJob:
    def __init__(
        self,
        settings: Config
    ) -> None:
        self.settings = settings
    
    def log(
        self,
        msg: str
    ):
        print(msg)

    async def _run(self) -> None:
        raise NotImplementedError

    @flow
    async def run(self) -> None:
        await self._run()
