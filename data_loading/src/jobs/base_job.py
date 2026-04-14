from prefect import flow
from typing import Any

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

    @flow
    async def run(self: Any) -> None:
        raise NotImplementedError
