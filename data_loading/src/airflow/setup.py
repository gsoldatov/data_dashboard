"""Script for initializing Airflow metadata database."""
import os
import subprocess

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[3]
    sys.path.insert(0, str(PROJECT_ROOT))

from data_loading.src.airflow.config import configure_airflow
from python_common.src import Config, get_config


def setup_airflow() -> None:
    """Creates Airflow metadata DB and admin user."""
    config = get_config()
    os.environ["AIRFLOW_HOME"] = str(config.airflow_directory)
    _init_airflow_db(config)
    _create_or_update_admin_user(config)


def _init_airflow_db(config: Config) -> None:
    """Configures Airflow and runs DB migrations."""
    configure_airflow(config)
    subprocess.run(
        ["uv", "run", "airflow", "db", "migrate"], check=True
    )
    print("Airflow metadata database initialized.")


def _create_or_update_admin_user(config: Config) -> None:
    """Creates or updates the admin user via the FAB auth manager."""
    # Import FAB provider models first so they override flask_appbuilder's
    # models with the same tablenames (Permission, ViewMenu, Role) before
    # flask_appbuilder registers its own copies.
    import airflow.providers.fab.auth_manager.models  # noqa: F401
    from airflow.providers.fab.auth_manager.cli_commands.utils import (
        get_application_builder,
    )
    from airflow.settings import engine as _airflow_engine  # noqa: F401
    from werkzeug.security import generate_password_hash

    with get_application_builder() as appbuilder:
        sm = appbuilder.sm
        user = sm.find_user(username=config.airflow_admin_username)
        admin_role = sm.find_role("Admin")

        if user:
            user.password = generate_password_hash(config.airflow_admin_password)
            sm.update_user(user)
            print(
                f"Updated password for existing user: "
                f"'{config.airflow_admin_username}'"
            )
        else:
            sm.add_user(
                username=config.airflow_admin_username,
                first_name="Admin",
                last_name="User",
                email=f"{config.airflow_admin_username}@localhost",
                role=admin_role,
                password=config.airflow_admin_password,
            )
            print(
                f"Created admin user: '{config.airflow_admin_username}'"
            )


if __name__ == "__main__":
    setup_airflow()
