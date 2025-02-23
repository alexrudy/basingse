from typing import Never

import structlog
from flask import abort
from flask import Blueprint
from flask import flash
from flask import render_template
from flask.typing import ResponseReturnValue as IntoResponse
from flask_login import current_user
from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import LogoSize
from .services import SiteSettings
from basingse import svcs
from basingse.page.models import Page

bp = Blueprint("customize", __name__, template_folder="templates")

logger = structlog.get_logger()


def logo_endpoint(size: LogoSize) -> IntoResponse:
    """Generic implementation for a logo endpoint."""
    settings = svcs.get(SiteSettings)
    logo = settings.logo.size(size)
    if logo is None:
        logger.warning("No logo found for size", size=size, debug=True)
        abort(404)

    session = svcs.get(Session)
    logo = session.merge(logo, load=False)
    return logo.send()


@bp.route("/brand/logo/<size>")
def logo(size: str) -> IntoResponse:
    try:
        sz = LogoSize[size.upper()]
    except KeyError:
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


def no_homepage(settings: SiteSettings) -> Never:
    if current_user.is_authenticated:
        flash("No homepage found, please set one in the admin interface", "warning")
    logger.warning("No homepage found, please set one in the admin interface", settings=settings)
    abort(404)


@bp.route("/")
def home() -> IntoResponse:

    settings = svcs.get(SiteSettings)
    session = svcs.get(Session)

    if settings.homepage_id is None:
        no_homepage(settings)

    # coverage is not needed here because the homepage_id is a foreign key, so this should
    # never happen
    if (homepage := session.get(Page, settings.homepage_id)) is None:  # pragma: nocover

        # Check if the homepage is unpublished
        if (
            session.scalar(
                select(Page).where(Page.id == settings.homepage_id).execution_options(include_upublished=True)
            )
            is not None
        ):
            logger.warning(
                "Homepage is set, but the ID points to an unpublished page", homepage_id=settings.homepage_id
            )
            abort(404)

        logger.warning("Homepage is set, but the ID points to a missing page", homepage_id=settings.homepage_id)
        abort(404)

    return render_template(["home.html", "page.html"], page=homepage)
