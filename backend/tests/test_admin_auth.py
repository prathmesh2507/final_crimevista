import os
import unittest
from unittest.mock import patch

from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from app.routes import auth
from app.security import create_admin_session, is_valid_admin_session, require_api_token


class AdminAuthenticationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.environment = patch.dict(
            os.environ,
            {
                "APP_ENV": "production",
                "API_ADMIN_TOKEN": "test-api-secret",
                "ADMIN_USERNAME": "test-admin",
                "ADMIN_PASSWORD": "test-password",
            },
            clear=False,
        )
        self.environment.start()

        app = FastAPI()
        self.app = app
        app.include_router(auth.router, prefix="/api")

        @app.get("/api/protected")
        def protected(_identity: str = Depends(require_api_token)):
            return {"protected": True}

        self.client = TestClient(app, base_url="https://testserver")

    def tearDown(self) -> None:
        self.client.close()
        self.environment.stop()

    def test_no_or_wrong_credential_is_rejected(self) -> None:
        self.assertEqual(self.client.get("/api/protected").status_code, 401)
        self.assertEqual(
            self.client.get(
                "/api/protected",
                headers={"Authorization": "Bearer wrong-token"},
            ).status_code,
            401,
        )
        response = self.client.post(
            "/api/auth/login",
            json={"username": "test-admin", "password": "wrong-password"},
        )
        self.assertEqual(response.status_code, 401)

    def test_login_cookie_authenticates_and_logout_revokes_browser_access(self) -> None:
        login = self.client.post(
            "/api/auth/login",
            json={"username": "test-admin", "password": "test-password"},
        )
        self.assertEqual(login.status_code, 200)
        self.assertIn("httponly", login.headers["set-cookie"].lower())
        self.assertIn("secure", login.headers["set-cookie"].lower())
        self.assertIn("samesite=strict", login.headers["set-cookie"].lower())
        self.assertEqual(self.client.get("/api/auth/session").json(), {"authenticated": True})
        self.assertEqual(self.client.get("/api/protected").status_code, 200)

        session_cookie = self.client.cookies.get("crimevista_admin_session")
        refreshed_client = TestClient(self.app, base_url="https://testserver")
        refreshed_client.cookies.set(
            "crimevista_admin_session",
            session_cookie,
            path="/api",
        )
        self.assertEqual(
            refreshed_client.get("/api/protected").status_code,
            200,
        )
        refreshed_client.close()

        logout = self.client.post("/api/auth/logout")
        self.assertEqual(logout.status_code, 200)
        self.assertEqual(self.client.get("/api/auth/session").json(), {"authenticated": False})
        self.assertEqual(self.client.get("/api/protected").status_code, 401)

    def test_server_token_remains_a_valid_direct_bearer_credential(self) -> None:
        response = self.client.get(
            "/api/protected",
            headers={"Authorization": "Bearer test-api-secret"},
        )
        self.assertEqual(response.status_code, 200)

    def test_session_signature_and_expiration_are_checked(self) -> None:
        session, expires_at = create_admin_session("test-api-secret", now=1000)
        self.assertTrue(is_valid_admin_session(session, "test-api-secret", now=1000))
        self.assertFalse(
            is_valid_admin_session(session, "test-api-secret", now=expires_at)
        )
        self.assertFalse(
            is_valid_admin_session(f"{session}tampered", "test-api-secret", now=1000)
        )
        self.assertFalse(is_valid_admin_session(None, "test-api-secret", now=1000))


if __name__ == "__main__":
    unittest.main()
