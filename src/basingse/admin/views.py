from typing import Any

import basingse.markdown
import structlog
from basingse.htmx import HtmxProperties
from flask import Blueprint
from flask import render_template
from flask import request
from flask.typing import ResponseReturnValue as IntoResponse
from flask_login import login_required
from werkzeug.exceptions import HTTPException

from .extension import Portal

__all__ = ["bp", "portal"]

bp = Blueprint("admin", __name__, url_prefix="/admin/", template_folder="templates")
log = structlog.get_logger(__name__)
portal = Portal(bp)

bp.context_processor(portal.context)


@bp.context_processor
def _hx_context() -> dict[str, Any]:
    return {"hx": HtmxProperties}


@bp.before_request
@login_required
def before_request() -> None:
    """Protect all of the admin endpoints."""
    pass


@bp.errorhandler(404)
def not_found(exception: BaseException) -> IntoResponse:
    return render_template("admin/not_found.html")


@bp.errorhandler(400)
def bad_request(exception: BaseException) -> IntoResponse:
    if isinstance(exception, HTTPException):
        if exception.response is not None:
            message = exception.response.data  # type: ignore[attr-defined]
        else:
            message = exception.description
    else:
        message = "This request went sour. We don't know why."

    return render_template("admin/bad_request.html", message=message)


@bp.route("/")
def home() -> IntoResponse:
    """Admin portal homepage"""

    return render_template("admin/home.html")


@bp.route("/markdown/", methods=["POST"])
def markdown() -> IntoResponse:
    """Render markdown for previews"""

    field = request.args["field"]
    data = request.form[field]

    return basingse.markdown.render(data)
