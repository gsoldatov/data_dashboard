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
    
    def load_file(self) -> None:
        with httpx.Client() as client:
            with client.stream("GET", self.url) as response:
                response.raise_for_status()
                
                with open(self.save_path, "wb") as f:
                    for chunk in response.iter_bytes():
                        f.write(chunk)
