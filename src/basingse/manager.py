import datetime as dt
import logging
from collections.abc import Callable
from functools import wraps
from typing import Any
from typing import cast
from typing import Optional
from typing import TYPE_CHECKING

from flask import _request_ctx_stack
from flask import Flask
from flask import has_request_context
from flask import make_response
from flask import Response
from flask_login import current_user
from flask_login import login_required
from flask_login import LoginManager
from sqlalchemy import func
from sqlalchemy import select
from werkzeug.exceptions import Unauthorized
from werkzeug.local import LocalProxy

from .models import Session
from .models import Token
from .models import User
from .models.authentication import AnonymousAuthentication
from .models.authentication import Authentication
from .models.authentication import AuthenticationMixin

if TYPE_CHECKING:
    from sqlalchemy.orm import Session as SASession  # noqa: F401
    from werkzeug import Request  # noqa: F401

__all__ = ["require_capability", "AuthUnauthorized", "LoginHandlers", "current_auth"]

log = logging.getLogger(__name__)


class AuthUnauthorized(Exception):
    """Raised to indicate an unauthorized response should be returned"""

    def __init__(self, auth: AuthenticationMixin, capability: str) -> None:
        self.auth = auth
        self.capability = capability

    def __str__(self) -> str:
        return f"Authentication {self.auth.kind.name:s} {self.auth!r} does not meet {self.capability:s} capability"


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

    def set_authorization(self, authentication: Optional[Authentication]) -> None:
        """
        Set the authorization scope
        """
        if authentication is not None and has_request_context():
            _request_ctx_stack.top.authorization = authentication

    def load_user(self, session_id: str) -> Optional[User]:
        """Loads an Authentication from the DB for use with flask-login

        If the auth doesn't exist, flask-login will transparently
        handle issues
        """

        now = dt.datetime.utcnow()
        stmt = (
            select(Session)
            .where(Session.token == session_id, Session.active == True, Session.revoke_at >= now)
            .order_by(Session.created.desc())
            .limit(1)
        )

        session: Optional[Session] = self.session.execute(stmt).scalar_one_or_none()
        if session is None:
            return None

        if session.expired():
            log.warning("Login attempted with expired session", extra=dict(session_id=session.id))
            return None
        self.set_authorization(session)
        return session.user

    def load_auth_from_request(self, request: "Request") -> Optional[User]:
        api_key = request.headers.get("Authorization")
        if api_key:
            api_key = api_key.replace("Bearer ", "", 1)

            stmt = (
                select(Token)
                .where(Token.token == api_key, Token.active == True, Token.revoke_at > func.current_time())
                .limit(1)
            )
            auth: Optional[Token] = self.session.execute(stmt).scalar_one_or_none()
            if auth is None:
                return auth

            self.set_authorization(auth)
            return auth.user
        return None


def require_capability(capability: str) -> Callable:
    """Require that the current user have a specific capability"""

    def _decorator(f: Callable) -> Callable:
        @login_required
        @wraps(f)
        def _on_request(*args: Any, **kwargs: Any) -> Any:

            if not current_auth.check_capability(capability):
                raise AuthUnauthorized(current_auth._get_current_object(), capability=capability)
            return f(*args, **kwargs)

        return _on_request

    return _decorator


def _get_authorization() -> AuthenticationMixin:

    # Force us to get the current user.
    _ = current_user._get_current_object()

    auth = getattr(_request_ctx_stack.top, "authorization", None)
    if auth is None:
        return AnonymousAuthentication()
    return auth


current_auth = cast(Authentication, LocalProxy(local=_get_authorization))
