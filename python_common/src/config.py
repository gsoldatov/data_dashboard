from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings
from typing import Literal, Any


_PROJECT_ROOT = Path(__file__).parents[2]


class Config(BaseSettings):
    data_directory: Path
    logs_directory: Path
    data_loading_log_mode: Literal["stderr", "file"]

    prefect_profile: str
    prefect_server_api_host: str
    prefect_server_api_port: int
    prefect_api_url: str

    @field_validator("data_directory", "logs_directory", mode="plain")
    @classmethod
    def validate_paths(cls, v: Any) -> Path:
        if not isinstance(v, (str, Path)):
            raise ValueError("Path must be a string or a Path instance.")
        return _resolve_abs_path(v)


def get_config(env_path: str | Path = "config.env") -> Config:
    """
    Reads, validates and returns environment variables object from
    file `env_path` (relative to project root or absolute)
    """
    env_path = _resolve_abs_path(env_path)
    if not env_path.is_file():
        raise ValueError(f"{str(env_path)} is not a file.")
    return Config(_env_file=str(env_path))    # type: ignore


def _resolve_abs_path(path: str | Path) -> Path:
    if isinstance(path, str):
        path = Path(path)
    
    if not path.is_absolute():
        path = _PROJECT_ROOT / path
    
    return path
