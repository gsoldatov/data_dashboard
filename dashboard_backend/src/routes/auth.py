"""Authentication routes (login, logout)."""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, Response

from dashboard_backend.src.db.repository import Repository
from dashboard_backend.src.models.session import LoginRequest
from dashboard_backend.src.models.user import UserResponse
from dashboard_backend.src.services.auth import anonymous_user

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=UserResponse)
async def login(
    data: LoginRequest,
    request: Request,
    _anon: None = Depends(anonymous_user),
) -> JSONResponse:
    """Create a session for valid credentials and return user data (anonymous only)."""
    repo: Repository = request.state.repository
    user = await repo.users.by_credentials(data.username, data.password)
    if user is None:
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid credentials"},
        )

    ttl = request.app.state.config.backend_session_ttl_seconds
    session = await repo.sessions.create(user.id, ttl)
    response = JSONResponse(
        status_code=200,
        content=UserResponse(
            id=user.id,
            username=user.username,
            role=user.role,
            created_at=user.created_at,
        ).model_dump(mode="json"),
    )
    response.set_cookie(
        key="session_token",
        value=session.token,
        httponly=True,
        max_age=ttl,
    )
    return response


@router.post("/logout", status_code=204)
async def logout(request: Request) -> Response:
    """Delete the session cookie if present (always succeeds)."""
    repo: Repository = request.state.repository
    token: str | None = request.cookies.get("session_token")
    if token is not None:
        await repo.sessions.delete(token)

    response = Response(status_code=204)
    response.delete_cookie(key="session_token")
    return response
