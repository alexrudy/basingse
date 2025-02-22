import dataclasses as dc
from enum import StrEnum
from typing import Never
from typing import NotRequired
from typing import TypedDict

import structlog
from flask import abort
from flask import Blueprint
from flask import flash
from flask import Flask
from flask import jsonify
from flask import render_template
from flask.typing import ResponseReturnValue
from flask_login import current_user
from sqlalchemy import select
from sqlalchemy.orm import Session

from basingse import svcs
from basingse.customize.models import SiteSettings
from basingse.customize.services import get_site_settings
from basingse.page.models import Page

logger = structlog.get_logger()

core = Blueprint("basingse", __name__, template_folder="templates", static_folder="static", url_prefix="/bss/")


def no_homepage(settings: SiteSettings) -> Never:
    if current_user.is_authenticated:
        flash("No homepage found, please set one in the admin interface", "warning")
    logger.warning("No homepage found, please set one in the admin interface", settings=settings)
    abort(404)


def home() -> ResponseReturnValue:
    settings = get_site_settings()
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


class ServiceStatus(StrEnum):
    OK = "ok"
    FAILING = "failing"


class ServiceHealth(TypedDict):
    status: ServiceStatus
    error: NotRequired[str]


def health() -> ResponseReturnValue:
    services: dict[str, ServiceHealth] = {}
    code = 200

    for svc in svcs.get_pings():
        try:
            svc.ping()

        except Exception as e:
            logger.debug("Healthcheck failed", service=svc.name, error=e)
            services[svc.name] = {"status": ServiceStatus.FAILING, "error": str(e)}
            code = 500
        else:
            services[svc.name] = {"status": ServiceStatus.OK}

    return jsonify(services), code


@dc.dataclass(frozen=True)
class CoreSettings:
    def init_app(self, app: Flask) -> None:
        app.register_blueprint(core)
        app.add_url_rule("/", "home", home)
        app.add_url_rule("/healthcheck", "health", health)
