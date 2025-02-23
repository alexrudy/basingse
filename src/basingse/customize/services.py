import contextlib
import importlib.resources
import json
import os.path
from collections.abc import Iterable
from collections.abc import Iterator
from typing import Any

import structlog
from flask import Flask
from flask import g
from flask_attachments import Attachment
from sqlalchemy import event
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import make_transient
from sqlalchemy.orm import Session

from .models import Logo
from .models import SiteSettings
from .models import SocialLink
from basingse import svcs
from basingse.page.models import Page
from basingse.utils.cache import cached

logger = structlog.get_logger()


def default_homepage() -> dict[str, Any]:
    resource = importlib.resources.files("basingse.customize") / "homepage.json"
    return json.loads(resource.read_text())


@contextlib.contextmanager
def session_for_customize(session: Session | None = None) -> Iterator[Session]:
    with contextlib.ExitStack() as stack:

        if session is None:
            if (session := g.get("_customize_session")) is None:
                engine = svcs.get(Engine)
                session = Session(engine, expire_on_commit=False, autobegin=False)
                g._customize_session = session

            stack.enter_context(session.begin())

        yield session


@cached
def get_site_settings(session: Session | None = None) -> SiteSettings:
    """Get the site settings"""
    with session_for_customize(session) as session:
        settings: SiteSettings | None = session.execute(
            select(SiteSettings).where(SiteSettings.active).limit(1)
        ).scalar_one_or_none()

        if settings is None:
            settings = default_settings(session)
            logger.warning("No site settings found, created default settings", debug=True)
            session.commit()
        make_transient(settings)
    return settings


@cached
def get_social_links() -> Iterable[SocialLink]:
    """Get the social links"""
    with session_for_customize() as session:
        query = select(SocialLink).order_by(SocialLink.order.asc())
        links = []
        for link in session.execute(query).scalars():
            make_transient(link)
            links.append(link)
    return links


@event.listens_for(SiteSettings, "after_update")
@event.listens_for(SiteSettings, "after_insert")
@event.listens_for(Logo, "after_update")
@event.listens_for(Logo, "after_insert")
def _clear_site_settings(*args: object) -> None:
    logger.info("Clearing site settings cache")
    get_site_settings.clear()


@event.listens_for(SocialLink, "after_update")
@event.listens_for(SocialLink, "after_insert")
@event.listens_for(SocialLink, "after_delete")
def _clear_social_links(*args: object) -> None:
    get_social_links.clear()


def default_settings(session: Session) -> SiteSettings:
    """Create a default settings object"""

    homepage = session.scalar(select(Page).where(Page.slug == "home"))
    if homepage is None:
        contents = json.dumps(default_homepage())
        homepage = Page(slug="home", title="Home", contents=contents)
        homepage.publish()
        session.add(homepage)

    default_settings = SiteSettings(active=True, title="Website", homepage=homepage)

    resource = importlib.resources.files("basingse") / "static/img/logo/default-logo.png"
    with importlib.resources.as_file(resource) as path:
        if os.path.isfile(path):
            logo = Attachment.from_file(path)
            session.add(logo)
            default_settings.logo.large = logo
    session.add(default_settings)

    return default_settings


def template_context() -> dict[str, object]:
    return {
        "site_settings": get_site_settings(),
        "social_links": get_social_links(),
    }


def init_app(app: Flask) -> None:
    get_site_settings.clear()
    get_social_links.clear()
    app.context_processor(template_context)
    svcs.register_factory(app, SiteSettings, get_site_settings)
