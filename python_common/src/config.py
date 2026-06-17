from pathlib import Path
from typing import Any, Literal

from pydantic import computed_field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

_PROJECT_ROOT = Path(__file__).parents[2]


class Config(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    assets_directory: Path

    data_loading_log_mode: Literal["stderr", "file"]

    prefect_profile: str
    prefect_server_api_host: str
    prefect_server_api_port: int
    prefect_api_url: str

    backend_host: str
    backend_port: int
    backend_default_user_name: str
    backend_default_user_password: str
    backend_session_ttl_seconds: int
    backend_expired_sessions_cleanup_interval: float
    backend_cors_origins: str

    @computed_field  # type: ignore[prop-decorator]
    @property
    def backend_database_url(self) -> str:
        """SQLAlchemy async connection URL derived from backend_database_path."""
        return f"sqlite+aiosqlite:///{self.backend_database_path}"

    @computed_field  # type: ignore[prop-decorator]
    @property
    def visualization_data_directory(self) -> Path:
        p = self.assets_directory / "visualization_data"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @computed_field  # type: ignore[prop-decorator]
    @property
    def logs_directory(self) -> Path:
        p = self.assets_directory / "logs"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @computed_field  # type: ignore[prop-decorator]
    @property
    def backend_database_path(self) -> Path:
        p = self.assets_directory / "dashboard_backend.db"
        p.parent.mkdir(parents=True, exist_ok=True)
        return p

    @computed_field  # type: ignore[prop-decorator]
    @property
    def prefect_directory(self) -> Path:
        p = self.assets_directory / "prefect"
        p.mkdir(parents=True, exist_ok=True)
        return p

    @field_validator("assets_directory", mode="plain")
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
