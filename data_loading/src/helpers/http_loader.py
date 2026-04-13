import httpx
from pathlib import Path


class HTTPLoader:
    def __init__(
        self,
        url: str,
        save_path: Path
    ):
        self.url = url
        self.save_path = save_path
    
    async def load_file(self) -> None:
        async with httpx.AsyncClient() as client:
            async with client.stream("GET", self.url) as response:
                response.raise_for_status()
                
                with open(self.save_path, "wb") as f:
                    async for chunk in response.aiter_bytes():
                        f.write(chunk)
