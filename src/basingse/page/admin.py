import functools
from collections.abc import Callable
from typing import Any
from typing import cast
from typing import TypeVar

import httpx
import structlog
from flask import current_app
from flask import jsonify
from flask import request
from flask.typing import ResponseReturnValue
from flask_attachments import Attachment
from flask_login import user_loaded_from_request
from flask_login import user_unauthorized
from sqlalchemy import select
from sqlalchemy.orm import Session

from .extension import get_extension
from .models import Page
from basingse import svcs
from basingse.admin.extension import AdminView
from basingse.admin.portal import PortalMenuItem
from basingse.admin.views import portal
from basingse.auth.extension import get_extension as get_auth_extension
from basingse.auth.models import User


logger = structlog.get_logger()


class PageAdmin(AdminView, blueprint=portal):
    url = "pages"
    key = "<uuid:id>"
    name = "page"
    model = Page
    nav = PortalMenuItem("Pages", "admin.page.list", "file-text", "page.view")

    def query(self) -> Any:
        session = svcs.get(Session)
        return session.scalars(select(Page).order_by(Page.slug).execution_options(include_upublished=True))

    def single(self, id: str) -> Any:
        session = svcs.get(Session)
        return session.scalars(select(Page).where(Page.id == id).execution_options(include_upublished=True))


F = TypeVar("F", bound=Callable[..., ResponseReturnValue])


class EditorJSException(Exception):
    """Base exception for editorjs errors"""

    status_code = 400
    message: str = "An error occurred"


class EditorJSUnauthorized(EditorJSException):
    """Exception for unauthorized requests"""

    status_code = 401
    message = "Unauthorized"

    def __init__(self, message: str = "Unauthorized") -> None:
        self.message = message
        user_unauthorized.send(current_app._get_current_object())  # type: ignore


@portal.errorhandler(EditorJSException)
def handle_editorjs_exception(error: EditorJSException) -> ResponseReturnValue:
    return jsonify({"success": 0, "error": error.message}), error.status_code


def require_editor_token() -> Callable[[F], F]:
    """Decorator to require a token to access the view, used with editorjs image uploads"""

    def decorator(func: F) -> F:
        @functools.wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> ResponseReturnValue:

            extension = get_extension()

            token = request.headers.get("AUTHORIZATION")
            if token is None:
                raise EditorJSUnauthorized("No token provided")

            token = token.removeprefix("Bearer ").strip()

            session = svcs.get(Session)

            try:
                user_token = extension.load_token(token)
                user = session.scalars(select(User).filter(User.token == user_token)).first()
                if user is None:
                    raise EditorJSUnauthorized("Invalid token provided")
            except Exception as e:
                logger.exception("Failed to load user from token", token=token)
                raise EditorJSUnauthorized("Invalid token provided") from e

            # Simulate loading the user from the request in a generic fashion.
            auth = get_auth_extension()
            user_loaded_from_request.send(current_app._get_current_object(), user=user)  # type: ignore
            auth.set_request_user(user)

            return func(*args, **kwargs)

        return cast(F, wrapper)

    return decorator


@portal.post("/upload")
@require_editor_token()
def upload() -> ResponseReturnValue:
    """Upload a file"""

    image = request.files.get("image")

    if image is None:
        raise EditorJSException("No file provided in field 'image'")

    session = svcs.get(Session)

    attachment = Attachment()
    attachment.receive(image)

    session.add(attachment)
    session.commit()

    return jsonify(
        {
            "success": 1,
            "file": {
                "url": attachment.link,
                "id": attachment.id,
            },
        }
    )


@portal.post("/fetch")
@require_editor_token()
def fetch() -> ResponseReturnValue:
    """Fetch a file from a URL and save it as an attachment"""

    data = request.json
    if data is None:
        raise EditorJSException("No JSON data provided")

    target_url = data.get("url")
    if target_url is None:
        raise EditorJSException("No 'url' provided in JSON data")

    client = svcs.get(httpx.Client)
    response = client.get(target_url)
    if response.status_code != 200:
        raise EditorJSException(f"Failed to fetch file, got status code: {response.status_code}")

    attachment = Attachment()
    attachment.data(response.content)

    session = svcs.get(Session)
    session.add(attachment)
    session.commit()

    return jsonify(
        {
            "success": 1,
            "file": {
                "url": attachment.link,
                "id": attachment.id,
            },
        }
    )
