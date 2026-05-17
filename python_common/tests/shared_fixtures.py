"""Shared fixtures for all subproject tests."""

import shutil
import uuid
from pathlib import Path


def create_temp_directory(
    tests_dir: Path, test_name: str
) -> Path:
    """
    Create a unique temporary directory for a test case under *tests_dir*/temp.

    Pattern: <tests_dir>/temp/<test_name>_<8-char-uuid>

    Existing directories for the same test case name are cleaned before
    creating the new one.  The directory is **not** deleted after the test
    so its contents can be inspected.
    """
    base_temp_dir = tests_dir / "temp"
    base_temp_dir.mkdir(exist_ok=True)

    unique_id = str(uuid.uuid4())[:8]
    dir_name = f"{test_name}_{unique_id}"
    temp_dir = base_temp_dir / dir_name

    for existing_dir in base_temp_dir.glob(f"{test_name}_*"):
        if existing_dir.is_dir():
            shutil.rmtree(existing_dir)

    temp_dir.mkdir(parents=True, exist_ok=True)
    return temp_dir
