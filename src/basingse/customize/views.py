import structlog
from flask import abort
from flask import Blueprint
from flask.typing import ResponseReturnValue as IntoResponse
from sqlalchemy.orm import Session

from .models import LogoSize
from .services import get_site_settings
from basingse import svcs

bp = Blueprint("customize", __name__, template_folder="templates")

logger = structlog.get_logger()


def logo_endpoint(size: LogoSize) -> IntoResponse:
    """Generic implementation for a logo endpoint."""
    settings = get_site_settings()
    logo = settings.logo.size(size)
    if logo is None:
        logger.warning("No logo found for size", size=size)
        abort(404)

    session = svcs.get(Session)
    logo = session.merge(logo, load=False)
    return logo.send()


@bp.route("/brand/logo/<size>")
def logo(size: str) -> IntoResponse:
    try:
        sz = LogoSize[size.upper()]
    except ValueError:
        abort(400, f"Invalid logo size: {size}")
    else:
        return logo_endpoint(sz)


@bp.route("/favicon.ico")
def favicon() -> IntoResponse:
    return logo_endpoint(LogoSize.FAVICON)


@bp.route("/apple-touch-icon.png")
def apple_touch_icon() -> IntoResponse:
    return logo_endpoint(LogoSize.LARGE)


@bp.route("/apple-touch-icon-precomposed.png")
def apple_touch_icon_precomposed() -> IntoResponse:
    return logo_endpoint(LogoSize.LARGE)
