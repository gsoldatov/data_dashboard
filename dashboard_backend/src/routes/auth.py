"""Authentication routes (login, logout)."""

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, Response

from dashboard_backend.src.db.repository import Repository, get_repo
from dashboard_backend.src.models.session import LoginRequest, SessionResponse
from dashboard_backend.src.services.auth import anonymous_user

router = APIRouter(tags=["auth"])


@router.post("/login", response_model=SessionResponse)
async def login(
    data: LoginRequest,
    request: Request,
    repo: Repository = Depends(get_repo),
    _anon: None = Depends(anonymous_user),
) -> JSONResponse:
    """Create a session for valid credentials (anonymous only)."""
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
        content=SessionResponse(
            user_id=session.user_id,
            expires_at=session.expires_at,
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
async def logout(
    request: Request,
    repo: Repository = Depends(get_repo),
) -> Response:
    """Delete the session cookie if present (always succeeds)."""
    token: str | None = request.cookies.get("session_token")
    if token is not None:
        await repo.sessions.delete(token)

    response = Response(status_code=204)
    response.delete_cookie(key="session_token")
    return response
