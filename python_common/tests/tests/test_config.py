"""
Test cases for Config model and get_config function.
"""
import sys
from pathlib import Path

import pytest

PROJECT_ROOT = Path(__file__).parents[3]
if __name__ == "__main__":
    sys.path.insert(0, str(PROJECT_ROOT))

from python_common.src.config import get_config


def test_get_config_loads_example_env_file() -> None:
    """config.env.example should be loadable and validated by get_config."""
    get_config("config.env.example")


def test_get_config_extra_env_vars_ignored(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Extra environment variables should be ignored by the Config model."""
    monkeypatch.setenv("EXTRA_UNKNOWN_PARAM", "should-be-ignored")
    monkeypatch.setenv("ANOTHER_EXTRA", "also-ignored")

    config = get_config("config.env.example")

    assert not hasattr(config, "EXTRA_UNKNOWN_PARAM")
    assert not hasattr(config, "ANOTHER_EXTRA")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
