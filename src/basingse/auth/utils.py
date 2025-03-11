from functools import cache
from functools import wraps
from typing import Any
from urllib import parse

import flask
import structlog
from flask import current_app
from flask import Flask
from flask import request
from itsdangerous import BadSignature
from itsdangerous.url_safe import URLSafeSerializer
from werkzeug.utils import redirect as base_redirect
from werkzeug.wrappers import Response

log = structlog.get_logger(__name__)


@cache
def serializer() -> URLSafeSerializer:
    """Create a serializer for the redirect token."""
    return URLSafeSerializer(current_app.config["SECRET_KEY"], salt="redirect")


def url_for(endpoint: str, *, _external: Any = None, _anchor: Any = None, **parameters: Any) -> str:
    """Create a URL for a view."""
    return flask.url_for(endpoint, _anchor=_anchor, _external=_external, **parameters)


def url_with(
    location: str,
    *,
    _external: Any = None,
    _scheme: Any = None,
    _anchor: Any = None,
    **parameters: Any,
) -> str:
    """Alter a url with new parameters.

    This is designed to work similarily to `url_for`, but for URLs instead of endpoints."""
    parts = parse.urlsplit(location)
    query = parse.parse_qs(parts.query)
    query.update(parameters)
    parts = parts._replace(query=parse.urlencode(query, doseq=True))
    if _anchor:
        parts = parts._replace(fragment=_anchor)
    if _external:
        parts = parts._replace(netloc=current_app.config["SERVER_NAME"])
    if _scheme:
        parts = parts._replace(scheme=_scheme)
    location = parse.urlunsplit(parts)
    return location


def wrap_redirect(func: Any) -> Any:
    """Wrap a redirect function to handle next tokens."""

    @wraps(func)
    def redirect_impl(location: str, code: int = 302, **kwargs: Any) -> Response:
        """Checks for a valid next token before completing the redirect to the indicated location"""
        next_token = request.args.get("next")
        if next_token:
            ser = serializer()
            next_page = ser.loads(next_token)
            kwargs["next"] = ser.dumps(next_page)
            log.debug("Injecting next page", next_page=next_page)

        if location.startswith("/") or location.startswith("http"):
            # Processing a URL
            uri = url_with(location, **kwargs)
        else:
            # Processing a view
            uri = url_for(location, **kwargs)
        log.debug("Redirecting", location=location, uri=uri)
        return func(uri, code)

    return redirect_impl


redirect = wrap_redirect(base_redirect)


def redirect_next(default: str = "home", **kwargs: Any) -> Response:
    """Redirect to the next page, if it exists, or fall back to a default."""
    next_page = request.args.get("next")
    if next_page:
        url = serializer().loads(next_page)

        # Only redirect to local URLs
        if parse.urlsplit(url).netloc == "":
            return base_redirect(url)

    if default and not default.startswith("/"):
        default = url_for(default, **kwargs)
    if not default:
        default = url_for("home")

    return base_redirect(default)


def url_for_next(endpoint: str, **kwargs: str) -> str:
    """Create a URL for an endpoint, attaching a next token if necessary."""
    next_token = kwargs.pop("next", None)
    if next_token is None:
        next_token = request.full_path

    # Check if the next token is already signed and valid
    try:
        serializer().loads(next_token)
    except BadSignature:
        kwargs["next"] = serializer().dumps(next_token)
    else:
        kwargs["next"] = next_token

    return url_for(endpoint, **kwargs)


def _context() -> dict[str, Any]:
    return {"url_for_next": url_for_next}


def init_app(app: Flask) -> None:
    app.context_processor(_context)

    # Safety: this just calls werkzeug's redirect anyways.
    # Ideally, this would just wrap redirect.
    app.redirect = wrap_redirect(app.redirect)  # type: ignore[method-assign]
