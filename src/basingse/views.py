import dataclasses as dc
from typing import Never

import structlog
from flask import abort
from flask import flash
from flask import Flask
from flask import render_template
from flask.typing import ResponseReturnValue
from flask_login import current_user
from sqlalchemy import select
from sqlalchemy.orm import Session

from basingse import svcs
from basingse.customize.models import SiteSettings
from basingse.page.models import Page

logger = structlog.get_logger()


def no_homepage(settings: SiteSettings) -> Never:
    if current_user.is_authenticated:
        flash("No homepage found, please set one in the admin interface", "warning")
    logger.warning("No homepage found, please set one in the admin interface", settings=settings)
    abort(404)


def home() -> ResponseReturnValue:
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


@dc.dataclass(frozen=True)
class CoreSettings:
    def init_app(self, app: Flask) -> None:
        app.add_url_rule("/", "home", home)
