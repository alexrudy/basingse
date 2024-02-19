import datetime as dt
import uuid
from typing import Any

import structlog
import svcs
from flask import abort
from flask import Blueprint
from flask import current_app
from flask import flash
from flask import Flask
from flask import jsonify
from flask import render_template
from flask import request
from flask import url_for
from flask_login import current_user
from flask_login import fresh_login_required
from flask_login import login_required
from flask_login import login_user
from flask_login import logout_user
from itsdangerous import BadSignature
from itsdangerous import SignatureExpired
from sqlalchemy import select
from sqlalchemy.orm import Session

from .extension import get_extension
from .forms import ChangePasswordForm
from .forms import LoginForm
from .models import User
from .permissions import require_permission
from .utils import redirect
from .utils import redirect_next


bp = Blueprint("auth", __name__, url_prefix="/auth/", template_folder="templates")

log = structlog.get_logger(__name__)


def get_or_404(session: Session, id: uuid.UUID) -> User:
    user = session.get(User, id)
    if user is None:
        log.info("User not found", id=id)
        abort(404)
    return user


@bp.route("/login/", methods=["GET", "POST"])
def login() -> Any:
    """Endpoint for form-based logins"""

    extension = get_extension()
    if current_user.is_authenticated:
        log.debug("Already authenticated", user=current_user)
        return redirect_next(extension.home)

    if "token" in request.args:
        return login_link(request.args["token"])

    form = LoginForm()
    if form.validate_on_submit():
        session = extension.session
        if not User.login(session, form.email.data, form.password.data):
            flash("Invalid username or password", category="error")
            log.info("Failed login attempt, redirecting", email=form.email.data)
            return redirect(url_for(".login"))

        session.commit()
        log.info("Authenticated", user=current_user)

        return redirect_next(extension.logged_in)

    return render_template("auth/login.html", title="Sign In", form=form)


def login_link(link_token: str) -> Any:
    """Endpoint for link-based logins"""
    extension = get_extension()
    serializer = extension.serializer("login-link")

    try:
        token = serializer.loads(link_token, max_age=current_app.config["LOGIN_LINK_EXPIRATION"])
    except SignatureExpired:
        log.debug("Expired login token")
        flash("Login link expired", category="error")
        return redirect(url_for(".login"))
    except BadSignature:
        log.debug("Bad login token")
        return redirect(url_for(".login"))

    session = extension.session
    user = session.execute(select(User).where(User.token == token)).scalar_one_or_none()
    if user is None:
        log.debug("Login link with unknown token")
        return redirect(url_for(".login"))

    if login_user(user):
        user.last_login = dt.datetime.utcnow()
        session.commit()
        log.info("Authenticated from login link", user=current_user)
        return redirect_next(extension.logged_in)

    log.info("Login failed", user=user)
    return redirect(url_for(".login"))


@bp.route("/password/", methods=["GET", "POST"])
@fresh_login_required
def password() -> Any:
    form = ChangePasswordForm()
    if form.validate_on_submit():
        user = current_user._get_current_object()
        if not user.compare_password(form.old_password.data):
            flash("Incorrect current password", category="error")
        else:
            extension = get_extension()
            session = svcs.flask.get(Session)
            user.password = form.new_password.data
            session.add(user)
            session.commit()
            return redirect_next(extension.logged_in)

    return render_template("auth/password.html", form=form)


@bp.route("/user/<uuid:id>/activate")
@require_permission("user.edit")
def user_activate(id: uuid.UUID) -> Any:
    session = svcs.flask.get(Session)
    user = get_or_404(session, id)
    user.active = True
    log.info("Activated user", user=user)
    session.commit()
    return redirect_next(get_extension().profile, id=user.id)


@bp.route("/user/<uuid:id>/deactivate")
@require_permission("user.edit")
def user_deactivate(id: uuid.UUID) -> Any:
    session = svcs.flask.get(Session)
    user = get_or_404(session, id)
    user.active = False
    log.info("Deactivated user", user=user)
    session.commit()
    return redirect_next(get_extension().profile, id=user.id)


@bp.route("/user/<uuid:id>/reset-session/")
@require_permission("user.edit")
def session_reset_token(id: uuid.UUID) -> Any:
    session = svcs.flask.get(Session)
    user = get_or_404(session, id)
    user.reset_token()
    session.commit()
    return redirect_next(get_extension().profile, id=user.id)


@bp.route("/me")
@login_required
def me() -> Any:
    if request.accept_mimetypes.accept_html:
        return redirect(get_extension().profile, id=current_user.id)
    schema = current_user.__schema__()
    return jsonify(schema.dump(current_user))


@bp.route("/logout/")
@login_required
def logout() -> Any:
    """Endpoint for UI-based logouts"""
    log.info(f"Logging out {current_user}")
    logout_user()
    return redirect_next("auth.login")


@bp.route("/testing/login/", methods=["POST"])
def dev_login() -> Any:
    if not current_app.testing:  # pragma: no cover
        log.warning("Test login attempted", testing=current_app.testing, env=current_app.config.get("ENV"))
        abort(401)

    if current_app.config.get("ENV", "").lower() == "production":  # pragma: no cover
        log.critical(
            "Test login attempted on production, but .testing didn't catch it?",
            testing=current_app.testing,
            env=current_app.config.get("ENV"),
        )
        abort(401)

    input_data = request.get_json() or {}
    email = input_data["email"]

    session = svcs.flask.get(Session)
    user = session.execute(select(User).where(User.email == email).limit(1)).scalar_one_or_none()
    if user is None:
        log.warning(
            "Test login failed unknown user",
            email=email,
            testing=current_app.testing,
            env=current_app.config.get("ENV"),
        )
        abort(404)

    if login_user(user):
        user.last_login = dt.datetime.utcnow()
        session.commit()
        log.info("Authenticated from testing endpoint", user=current_user)
        return ("", 204)
    log.info("Login failed", user=user)
    abort(401)


def init_app(app: Flask) -> None:
    lm = app.login_manager  # type: ignore[attr-defined]
    lm.blueprint_login_views[bp.name] = f"{bp.name}.login"
    lm.login_view = f"{bp.name}.login"
    app.register_blueprint(bp)
