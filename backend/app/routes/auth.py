import hmac
import os

from fastapi import APIRouter, HTTPException, Request, Response, status
from pydantic import BaseModel, Field

from ..security import (
    ADMIN_SESSION_COOKIE,
    ADMIN_SESSION_TTL_SECONDS,
    app_environment,
    create_admin_session,
    get_expected_api_token,
    is_valid_admin_session,
)

router = APIRouter()


class AdminLoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=128)
    password: str = Field(min_length=1, max_length=1024)


def _admin_login_credentials() -> tuple[str, str]:
    username = os.getenv("ADMIN_USERNAME", "").strip()
    password = os.getenv("ADMIN_PASSWORD", "")
    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Administrator login is not configured on the server.",
        )
    return username, password


@router.post("/auth/login")
def admin_login(
    credentials: AdminLoginRequest,
    response: Response,
) -> dict[str, bool]:
    expected_username, expected_password = _admin_login_credentials()
    if (
        app_environment() == "production"
        and not os.getenv("API_ADMIN_TOKEN", "").strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Administrator authentication is not configured on the server.",
        )
    api_token = get_expected_api_token()
    if not api_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Administrator authentication is not configured on the server.",
        )

    username_matches = hmac.compare_digest(
        credentials.username.encode("utf-8"), expected_username.encode("utf-8")
    )
    password_matches = hmac.compare_digest(
        credentials.password.encode("utf-8"), expected_password.encode("utf-8")
    )
    if not (username_matches and password_matches):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid administrator username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    session, _expires_at = create_admin_session(api_token)
    response.set_cookie(
        key=ADMIN_SESSION_COOKIE,
        value=session,
        max_age=ADMIN_SESSION_TTL_SECONDS,
        httponly=True,
        secure=app_environment() == "production",
        samesite="strict",
        path="/api",
    )
    return {"authenticated": True}


@router.post("/auth/logout")
def admin_logout(response: Response) -> dict[str, bool]:
    response.delete_cookie(
        key=ADMIN_SESSION_COOKIE,
        httponly=True,
        secure=app_environment() == "production",
        samesite="strict",
        path="/api",
    )
    return {"authenticated": False}


@router.get("/auth/session")
def admin_session(request: Request) -> dict[str, bool]:
    api_token = os.getenv("API_ADMIN_TOKEN", "").strip()
    session = request.cookies.get(ADMIN_SESSION_COOKIE)
    return {
        "authenticated": bool(
            api_token and is_valid_admin_session(session, api_token)
        )
    }
