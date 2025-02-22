import structlog
from flask import render_template
from flask import request
from flask.typing import ResponseReturnValue as IntoResponse
from flask_login import login_required
from werkzeug.exceptions import HTTPException

import basingse.markdown
from .portal import Portal

__all__ = ["portal", "portal"]

portal = Portal("admin", __name__, url_prefix="/admin/", template_folder="templates")
log = structlog.get_logger(__name__)


@portal.before_request
@login_required
def before_request() -> None:
    """Protect all of the admin endpoints."""
    pass


@portal.errorhandler(404)
def not_found(exception: BaseException | int) -> IntoResponse:
    return render_template("admin/not_found.html")


@portal.errorhandler(400)
def bad_request(exception: BaseException | int) -> IntoResponse:
    if isinstance(exception, HTTPException):
        if exception.response is not None:
            return exception.response
        else:
            message = exception.description
    else:
        log.exception("Bad request", exc_info=True)
        message = "This request went sour. We don't know why."

    return render_template("admin/bad_request.html", message=message)


@portal.route("/")
def home() -> IntoResponse:
    """Admin portal homepage"""

    return render_template("admin/home.html")


@portal.route("/markdown/", methods=["POST"])
def markdown() -> IntoResponse:
    """Render markdown for previews"""

    field = request.args["field"]
    data = request.form[field]

    return basingse.markdown.render(data)
