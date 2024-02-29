from basingse import svcs
from flask import Flask
from flask.cli import AppGroup
from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import SiteSettings
from .models import SocialLink
from .services import default_settings


customize = AppGroup("customize", help="Manage site customization setup")


@customize.command("init")
def init() -> None:
    """Set defaults for site customization"""
    session = svcs.get(Session)

    has_active = session.execute(select(SiteSettings).where(SiteSettings.active)).scalar_one_or_none() is not None

    settings = default_settings(session)
    settings.active = not has_active
    session.add(settings)

    links = []
    for link in ("Youtube", "Instagram"):
        links.append(SocialLink(name=link, url=f"https://{link.lower()}.com", icon=link.lower()))
    session.add_all(links)
    session.commit()


def init_app(app: Flask) -> None:
    app.cli.add_command(customize)
