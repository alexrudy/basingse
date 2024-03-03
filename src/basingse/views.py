import dataclasses as dc

import structlog
from basingse import svcs
from basingse.customize.services import get_site_settings
from basingse.page.models import Page
from flask import abort
from flask import flash
from flask import Flask
from flask import render_template
from flask.typing import ResponseReturnValue
from flask_login import current_user
from sqlalchemy.orm import Session

logger = structlog.get_logger()


def home() -> ResponseReturnValue:
    settings = get_site_settings()
    session = svcs.get(Session)

    if settings.homepage_id is not None and (homepage := session.get(Page, settings.homepage_id)) is None:
        if current_user.is_authenticated:
            flash("No homepage found, please set one in the admin interface", "warning")
        logger.warning(
            "No homepage found, please set one in the admin interface", settings=settings, homepage=settings.homepage_id
        )
        abort(404)

    return render_template("page.html", page=homepage)


@dc.dataclass(frozen=True)
class CoreSettings:
    def init_app(self, app: Flask) -> None:
        app.add_url_rule("/", "home", home)
