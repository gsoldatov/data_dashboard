"""
Creates or updates Prefect profile for the current server
(environment variables in ~/.prefect/profiles.toml file)
"""
# mypy: disable-error-code="dict-item"
from pathlib import Path

from prefect.settings import load_profiles, save_profiles

PROJECT_ROOT = Path(__file__).parents[4]
if __name__ == "__main__":
    import sys
    sys.path.insert(0, str(PROJECT_ROOT))

from python_common.src import get_config


def main() -> None:
    config = get_config()

    # Configure Prefect profile
    profiles = load_profiles()

    db_location = config.prefect_directory / "db.sqlite"
    db_location.parent.mkdir(parents=True, exist_ok=True)
    prefect_db_uri = f"sqlite+aiosqlite:////{str(db_location)}"

    profiles.update_profile(
        name=config.prefect_profile,
        settings={
            "PREFECT_SERVER_API_HOST": config.prefect_server_api_host,
            "PREFECT_SERVER_API_PORT": config.prefect_server_api_port,
            "PREFECT_API_URL": config.prefect_api_url,

            # Set custom DB URI
            "PREFECT_API_DATABASE_CONNECTION_URL": prefect_db_uri,

            # Increase time limit for writing to database to avoid lock errors
            "PREFECT_API_DATABASE_CONNECTION_TIMEOUT": "30"
    })    # type: ignore[dict-item, unused-ignore]

    save_profiles(profiles)
    print(f"Updated Prefect profile '{config.prefect_profile}'.")


if __name__ == "__main__":
    main()
