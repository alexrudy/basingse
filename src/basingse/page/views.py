from basingse import svcs
from basingse.models import Session
from flask import abort
from flask import Blueprint
from flask import flash
from flask import render_template
from sqlalchemy import select

from .models import Page

bp = Blueprint("page", __name__, template_folder="templates")


@bp.route("/page/<slug>/")
def page(slug: str) -> str:
    session = svcs.get(Session)

    page = session.execute(select(Page).where(Page.slug == slug)).scalar_one_or_none()
    if page is None:
        flash(f"/{slug} not found.")
        abort(404)

    return render_template("page.html", page=page)
