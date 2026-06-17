"""Utilities for setting up test data directories."""

import shutil
from pathlib import Path


def copy_test_directories(dest: Path, names: list[str], src: Path) -> None:
    """Copy named subdirectories from *src* into *dest*.

    Existing targets are removed first so the function is idempotent.
    """
    for name in names:
        target = dest / name
        if target.exists():
            shutil.rmtree(target)
        shutil.copytree(src / name, target)
