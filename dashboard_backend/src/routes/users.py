"""User management routes."""

from fastapi import APIRouter, Depends

from dashboard_backend.src.db.repository import Repository, get_repo
from dashboard_backend.src.models.user import User, UserCreate, UserResponse, UserUpdate
from dashboard_backend.src.services.auth import admin_user, self_or_admin
from dashboard_backend.src.util.exceptions import NotFoundException

router = APIRouter(tags=["users"])


@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int,
    repo: Repository = Depends(get_repo),
) -> User:
    """Return public data for a user (no authentication required)."""
    user = await repo.users.by_id(user_id)
    if user is None:
        raise NotFoundException(f"User {user_id} not found")
    return user


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(
    data: UserCreate,
    current: User = Depends(admin_user),
    repo: Repository = Depends(get_repo),
) -> User:
    """Create a new user (admin only)."""
    return await repo.users.insert(data)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    current: User = Depends(self_or_admin),
    repo: Repository = Depends(get_repo),
) -> User:
    """Update an existing user (admin or the user themselves)."""
    return await repo.users.update(user_id, data)


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    current: User = Depends(admin_user),
    repo: Repository = Depends(get_repo),
) -> None:
    """Delete a user (admin only)."""
    await repo.users.delete(user_id)
