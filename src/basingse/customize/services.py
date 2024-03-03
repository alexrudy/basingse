import importlib.resources
import os.path
from collections.abc import Iterable

import structlog
from basingse import svcs
from basingse.page.models import Page
from basingse.utils.cache import cached
from flask import Flask
from flask import g
from flask_attachments import Attachment
from sqlalchemy import event
from sqlalchemy import select
from sqlalchemy.engine import Engine
from sqlalchemy.orm import make_transient
from sqlalchemy.orm import Session

from .models import SiteSettings
from .models import SocialLink


logger = structlog.get_logger()


def get_session() -> Session:
    if (session := g.get("_customize_session")) is not None:
        return session

    engine = svcs.get(Engine)
    session = Session(engine, expire_on_commit=False)
    g._customize_session = session
    return session


@cached
def get_site_settings() -> SiteSettings:
    """Get the site settings"""
    session = get_session()
    settings: SiteSettings | None = session.execute(
        select(SiteSettings).where(SiteSettings.active).limit(1)
    ).scalar_one_or_none()
    if settings is None:
        settings = default_settings(session)
        logger.warning("No site settings found, created default settings")

    make_transient(settings)
    return settings


@cached
def get_social_links() -> Iterable[SocialLink]:
    """Get the social links"""
    session = get_session()
    query = select(SocialLink).order_by(SocialLink.order.asc())
    links = []
    for link in session.execute(query).scalars():
        make_transient(link)
        links.append(link)
    return links


@event.listens_for(SiteSettings, "after_update")
def _clear_site_settings(*args: object) -> None:
    get_site_settings.clear()


@event.listens_for(SocialLink, "after_update")
@event.listens_for(SocialLink, "after_insert")
@event.listens_for(SocialLink, "after_delete")
def _clear_social_links(*args: object) -> None:
    get_social_links.clear()


def default_settings(session: Session) -> SiteSettings:
    """Create a default settings object"""

    homepage = session.scalar(select(Page).where(Page.slug == "home"))

    default_settings = SiteSettings(active=False, title="Website", homepage=homepage)

    path = importlib.resources.files("basingse") / "static/img/defaults/logo.png"
    if os.path.isfile(path):  # type: ignore[arg-type]
        logo = Attachment.from_file(path)  # type: ignore[arg-type]
        session.add(logo)
        default_settings.logo.large = logo

    session.add(default_settings)
    session.commit()

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
