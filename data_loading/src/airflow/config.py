"""Script for managing Airflow configuration: writes airflow.cfg to disk."""
import subprocess
from pathlib import Path

if __name__ == "__main__":
    import sys
    from pathlib import Path

    PROJECT_ROOT = Path(__file__).parents[3]
    sys.path.insert(0, str(PROJECT_ROOT))

from python_common.src import Config, get_config


def configure_airflow(config: Config) -> None:
    """ Generates airflow.cfg file with custom settings from project's config. """
    cfg_path = config.airflow_directory / "airflow.cfg"
    cfg_path.parent.mkdir(parents=True, exist_ok=True)

    # Remove existing file
    if cfg_path.exists():
        cfg_path.unlink()

    # Create & read a default airflow.cfg
    # (so that all config sections are available)
    subprocess.run(
        ["uv", "run", "airflow", "config", "list", "--defaults"],
        stdout=open(cfg_path, "w"),
        check=True
    )

    import configparser
    parser = configparser.ConfigParser()
    parser.read(cfg_path)

    dags_path = Path(__file__).parents[1] / "dags"

    # # Ensure required config sections exist
    # for section in ["core", "database", "api"]:
    #     if not parser.has_section(section):
    #         parser.add_section(section)

    # Set basic settings
    parser.set("core", "dags_folder", str(dags_path.resolve()))
    parser.set(
        "database",
        "sql_alchemy_conn",
        f"sqlite:///{config.airflow_directory}/airflow.db",
    )
    parser.set(
        "core",
        "execution_api_server_url",
        f"http://127.0.0.1:{config.airflow_port}/execution/"
    )

    # Set auth settings
    parser.set(
        "core",
        "auth_manager",
        "airflow.providers.fab.auth_manager.fab_auth_manager.FabAuthManager",
    )
    parser.set(
        "fab",
        "config_file",
        str((Path(__file__).parent / "webserver_config.py").resolve()),
    )
    parser.set("api_auth", "jwt_secret", config.airflow_jwt_secret)
    parser.set("api", "secret_key", config.airflow_jwt_secret)

    # Set memory optimization settings
    parser.set("core", "parallelism", "1")
    parser.set("core", "max_active_tasks_per_dag", "1")
    parser.set("core", "max_active_runs_per_dag", "1")
    parser.set("api", "workers", "1")
    parser.set("api", "worker_refresh_interval", "86400")
    parser.set("api", "expose_config", "True")

    # Write config file back to disk
    with open(cfg_path, "w") as f:
        parser.write(f)


if __name__ == "__main__":
    config = get_config()
    configure_airflow(config)
    print(f"Airflow configured. AIRFLOW_HOME={config.airflow_directory}")
