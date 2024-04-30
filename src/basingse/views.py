import dataclasses as dc
from typing import Never

import structlog
from flask import abort
from flask import Blueprint
from flask import flash
from flask import Flask
from flask import render_template
from flask.typing import ResponseReturnValue
from flask_login import current_user
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
        no_homepage(settings)

    return render_template("page.html", page=homepage)


def health() -> ResponseReturnValue:
    ok: list[str] = []
    failing: list[dict[str, str]] = []
    code = 200

    for svc in svcs.get_pings():
        try:
            svc.ping()
            ok.append(svc.name)
        except Exception as e:
            logger.debug("Healthcheck failed", service=svc.name, error=e)
            failing.append({svc.name: repr(e)})
            code = 500

    return {"ok": ok, "failing": failing}, code


@dc.dataclass(frozen=True)
class CoreSettings:
    def init_app(self, app: Flask) -> None:
        app.add_url_rule("/", "home", home)
        app.add_url_rule("/healthcheck", "health", health)
