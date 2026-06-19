"""Password hashing and verification using bcrypt."""

import bcrypt


def hash_password(password: str) -> str:
    """Return a bcrypt hash of *password* as a string."""
    return str(bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode())


def verify_password(password: str, hashed: str) -> bool:
    """Check *password* against a bcrypt *hashed* string."""
    return bool(bcrypt.checkpw(password.encode(), hashed.encode()))
