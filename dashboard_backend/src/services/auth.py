"""Auth service — session validation and user dependencies."""

from fastapi import HTTPException, Request

from dashboard_backend.src.models.user import User


async def admin_user(request: Request) -> User:
    """Return the authenticated admin User; raises 401/403 on failure."""
    current: User | None = request.state.current_user
    if current is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if current.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return current


async def self_or_admin(
    user_id: int,
    request: Request,
) -> User:
    """Return the authenticated User if admin or the target user; 401/403 otherwise."""
    current: User | None = request.state.current_user
    if current is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if current.role != "admin" and current.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return current


async def anonymous_user(request: Request) -> None:
    """Require that the request has no valid session; raises 403 otherwise."""
    if request.state.current_user is not None:
        raise HTTPException(status_code=403, detail="Already authenticated")
