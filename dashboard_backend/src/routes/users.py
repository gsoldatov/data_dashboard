"""User management routes."""

from fastapi import APIRouter, Depends, Request

from dashboard_backend.src.db.repository import Repository
from dashboard_backend.src.models.user import User, UserCreate, UserResponse, UserUpdate
from dashboard_backend.src.services.auth import admin_user, self_or_admin
from dashboard_backend.src.util.exceptions import NotFoundException

router = APIRouter(tags=["users"])


@router.get("/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int,
    request: Request,
) -> User:
    """Return public data for a user (no authentication required)."""
    repo: Repository = request.state.repository
    user = await repo.users.by_id(user_id)
    if user is None:
        raise NotFoundException(f"User {user_id} not found")
    return user


@router.post("", response_model=UserResponse, status_code=201)
async def create_user(
    data: UserCreate,
    request: Request,
    current: User = Depends(admin_user),
) -> User:
    """Create a new user (admin only)."""
    repo: Repository = request.state.repository
    return await repo.users.insert(data)


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    data: UserUpdate,
    request: Request,
    current: User = Depends(self_or_admin),
) -> User:
    """Update an existing user (admin or the user themselves)."""
    repo: Repository = request.state.repository
    return await repo.users.update(user_id, data, current.id)


@router.delete("/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    request: Request,
    current: User = Depends(admin_user),
) -> None:
    """Delete a user (admin only)."""
    repo: Repository = request.state.repository
    await repo.users.delete(user_id)
