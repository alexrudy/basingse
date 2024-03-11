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

core = Blueprint("core", __name__, template_folder="templates")


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

    if (homepage := session.get(Page, settings.homepage_id)) is None:
        no_homepage(settings)

    return render_template("page.html", page=homepage)


@dc.dataclass(frozen=True)
class CoreSettings:
    def init_app(self, app: Flask) -> None:
        app.add_url_rule("/", "home", home)
        app.register_blueprint(core)
