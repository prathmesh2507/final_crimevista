import os
from typing import Annotated

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

bearer_scheme = HTTPBearer(auto_error=False)


def app_environment() -> str:
    return os.getenv("APP_ENV", "development").strip().lower()


def get_expected_api_token() -> str:
    token = os.getenv("API_ADMIN_TOKEN", "").strip()
    if app_environment() == "production" and not token:
        raise RuntimeError(
            "API_ADMIN_TOKEN is required in production. Configure it in the Render environment variables."
        )
    return token


def require_api_token(
    credentials: Annotated[
        HTTPAuthorizationCredentials | None,
        Security(bearer_scheme),
    ] = None,
) -> str:
    expected_token = get_expected_api_token()
    if not expected_token and app_environment() != "production":
        return ""

    if credentials is None or credentials.credentials != expected_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Set API_ADMIN_TOKEN and send Authorization: Bearer <token>",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return credentials.credentials
