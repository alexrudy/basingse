import datetime as dt
import logging
from collections.abc import Callable
from functools import wraps
from typing import Any
from typing import Optional
from typing import TYPE_CHECKING

from flask import Flask
from flask import make_response
from flask import Response
from flask_login import current_user
from flask_login import login_required
from flask_login import LoginManager
from sqlalchemy import select
from werkzeug.exceptions import Unauthorized

from .models import Authorization
from .models import Session
from .models import Token

if TYPE_CHECKING:
    from sqlalchemy.orm import Session as SASession  # noqa: F401
    from werkzeug import Request  # noqa: F401

__all__ = ["require_capability", "AuthUnauthorized", "LoginHandlers"]

log = logging.getLogger(__name__)


class AuthUnauthorized(Exception):
    """Raised to indicate an unauthorized response should be returned"""

    def __init__(self, auth: Authorization, capability: str) -> None:
        self.auth = auth
        self.capability = capability

    def __str__(self) -> str:
        return f"Authentication {self.auth} does not meet {self.capability} capability"


class LoginHandlers:
    def __init__(self, session: SASession, manager: LoginManager, app: Optional[Flask] = None) -> None:
        self.session = session
        self.manager = manager
        if app is not None:
            self.init_app(app)

    def init_app(self, app: Flask) -> None:
        app.errorhandler(AuthUnauthorized)(self.handle_unauthorized_error)
        self.manager.user_loader(self.load_user)
        self.manager.request_loader(self.load_auth_from_request)

    def handle_unauthorized_error(self, error: AuthUnauthorized) -> Response:
        log.error(
            str(error),
            exc_info=False,
            extra={
                "authorization": error.auth.id,
                "authorization_kind": error.auth.kind,
                "capability": error.capability,
            },
        )
        try:
            return self.manager.unauthorized()
        except Unauthorized:
            return make_response(("", 401))

    def load_user(self, session_id: str) -> Optional[Authorization]:
        """Loads an Authentication from the DB for use with flask-login

        If the auth doesn't exist, flask-login will transparently
        handle issues
        """

        now = dt.datetime.utcnow()
        stmt = (
            select(Session)
            .where(Session.token == session_id, Session.active, Session.revoke_at >= now)
            .order_by(Session.created.desc())
            .limit(1)
        )

        session: Optional[Session] = self.session.execute(stmt).scalar_one_or_none()
        if session is None:
            return None

        if session.expired():
            log.warning("Login attempted with expired session", extra=dict(session_id=session.id))
            return None
        return Authorization(source=session)

    def load_auth_from_request(self, request: "Request") -> Optional[Authorization]:
        api_key = request.headers.get("Authorization")
        if api_key:
            api_key = api_key.replace("Bearer ", "", 1)

            stmt = select(Token).where(Token.token == api_key, Token.active).limit(1)
            auth: Optional[Token] = self.session.execute(stmt).scalar_one_or_none()
            if auth is None:
                return auth

            return Authorization(source=auth)
        return None


def require_capability(capability: str) -> Callable:
    """Require that the current user have a specific capability"""

    def _decorator(f: Callable) -> Callable:
        @login_required
        @wraps(f)
        def _on_request(*args: Any, **kwargs: Any) -> Any:

            current_user.check_capability(capability)
            return f(*args, **kwargs)

        return _on_request

    return _decorator
