import httpx
from pathlib import Path
import traceback


class HTTPLoader:
    def __init__(
        self,
        url: str,
        save_path: Path
    ):
        self.url = url
        self.save_path = save_path
    
    def log(self, msg: str) -> None:
        print(msg)
    
    async def load_file(self) -> None:
        async with httpx.AsyncClient() as client:
            try:
                async with client.stream("GET", self.url) as response:
                    response.raise_for_status()
                    
                    with open(self.save_path, "wb") as f:
                        async for chunk in response.aiter_bytes():
                            f.write(chunk)
                
                self.log(f"Saved {self.url} to {str(self.save_path)}")

            except Exception as exc:
                self.log(
                    f"An exception occured during file fetch: {str(exc)}"
                    f"\n{traceback.print_exc()}"
                )
