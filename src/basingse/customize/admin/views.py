import dataclasses as dc

import structlog
from flask import flash
from flask import Flask
from flask import redirect
from flask import render_template
from flask import request
from flask import url_for
from flask.typing import ResponseReturnValue as IntoResponse
from flask_attachments import Attachment
from sqlalchemy import delete
from sqlalchemy import func
from sqlalchemy import select

from ..models import Logo
from ..models import SiteSettings
from ..models import SocialLink
from .forms import SettingsForm
from basingse import svcs
from basingse.admin.extension import AdminBlueprint
from basingse.admin.extension import PortalMenuItem
from basingse.models import Session
from basingse.utils.settings import BlueprintOptions

log = structlog.get_logger(__name__)


bp = AdminBlueprint("customize", __name__, template_folder="templates")
menu = PortalMenuItem("Settings", "admin.customize.edit", "gear", "customize.edit")


def init_app(app: Flask, options: BlueprintOptions) -> None:
    from ...admin.views import portal

    if not portal._got_registered_once:
        portal.register_blueprint(bp, **dc.asdict(options))
        portal.add_menu_item(menu)


@bp.route("/settings/edit", methods=["GET", "POST"])
def edit() -> IntoResponse:
    session = svcs.get(Session)
    query = select(SiteSettings).where(SiteSettings.active).limit(1)

    settings = session.execute(query).scalar_one_or_none()
    if settings is None:
        settings = SiteSettings()
        session.add(settings)
        session.flush()

    form = SettingsForm(obj=settings)
    if form.validate_on_submit():
        if settings.logo is None:
            settings.logo = Logo()
        form.populate_obj(settings)
        session.commit()
        flash("Settings saved", "success")
        return redirect(url_for("admin.customize.edit"))

    return render_template("admin/settings/edit.html", form=form, settings=settings)


@bp.route("/settings/delete-logo/<attachment_id>")
def delete_logo(attachment_id: str) -> IntoResponse:
    session = svcs.get(Session)

    query = select(SiteSettings).where(SiteSettings.active).limit(1)

    settings = session.execute(query).scalar_one_or_none()
    if settings is None:
        settings = SiteSettings()
        session.add(settings)
        session.flush()

    if settings.logo.small_id == attachment_id:
        settings.logo.small_id = None
    if settings.logo.large_id == attachment_id:
        settings.logo.large_id = None
    if settings.logo.text_id == attachment_id:
        settings.logo.text_id = None
    if settings.logo.favicon_id == attachment_id:
        settings.logo.favicon_id = None

    attachment = session.get_or_404(Attachment, attachment_id)  # type: ignore[arg-type]
    session.delete(attachment)
    session.commit()
    session.refresh(settings)

    form = SettingsForm(obj=settings)

    return render_template("admin/settings/_logo.html", form=form, settings=settings, logo=form.logo)


@bp.route("/settings/social/delete-image/<id>")
def delete_social_image(id: str) -> IntoResponse:
    session = svcs.get(Session)

    query = select(Attachment).where(Attachment.id == id)
    attachment = session.execute(query).scalar_one_or_none()
    if attachment is not None:
        session.delete(attachment)
        session.commit()
    return render_social_partial()


def render_social_partial() -> IntoResponse:
    session = svcs.get(Session)

    query = select(SiteSettings).where(SiteSettings.active).limit(1)

    settings = session.execute(query).scalar_one_or_none()
    if settings is None:
        settings = SiteSettings()
        session.add(settings)
        session.flush()
    settings.refresh_links()
    form = SettingsForm(obj=settings)
    links = form.links

    log.debug("Render form for links", links=len(links))

    return render_template("admin/settings/_social.html", links=links, settings=settings)


@bp.post("/settings/social/order-links")
def social_link_order() -> IntoResponse:
    new_order = request.get_json()["item"]
    session = svcs.get(Session)

    query = select(SocialLink)
    links = session.scalars(query)

    links = {str(link.id): link for link in links}

    for i, id in enumerate(new_order, start=1):
        link = links.get(id)
        if link is None:
            log.warning(f"Got an invalid link ID {id}")
            session.rollback()
            return (f"Invalid Link ID {id}", 400)
        link.order = i

    session.commit()
    return ("", 204)


@bp.get("/settings/social/append-link")
def social_link_append() -> IntoResponse:
    session = svcs.get(Session)
    query = select(func.count(SocialLink.id))
    n = session.scalar(query) or 0

    new_link = SocialLink(order=n + 1)
    session.add(new_link)
    session.commit()
    return render_social_partial()


@bp.get("/settings/social/delete-link/<id>")
def social_link_delete(id: str) -> IntoResponse:
    session = svcs.get(Session)

    query = delete(SocialLink).where(SocialLink.id == id)
    session.execute(query)
    session.commit()

    return render_social_partial()
