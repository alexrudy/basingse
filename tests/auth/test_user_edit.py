from typing import Any
from uuid import UUID

import pytest
import structlog
from flask import Flask
from sqlalchemy.orm import Session

from basingse import svcs
from basingse.auth.models import User
from basingse.auth.testing import LoginClient
from basingse.auth.testing import Ok
from basingse.auth.testing import Redirect

log = structlog.get_logger(__name__)


@pytest.fixture
def admin(user: Any) -> User:
    return user("admin")


@pytest.fixture
def author(user: Any) -> User:
    return user("author")


def test_edit_user(app: Flask, author: User, client: LoginClient) -> None:

    from flask import abort
    from flask import redirect
    from flask import render_template
    from basingse.auth.forms import UserEditForm
    from flask.typing import ResponseReturnValue as IntoResponse

    @app.route("/user/<uuid:user_id>/edit/", methods=["GET", "POST"])
    def edit_user(user_id: UUID) -> IntoResponse:
        session = svcs.get(Session)
        user = session.get(User, user_id)
        if user is None:
            log.warn("User not found", user_id=user_id)
            abort(404)

        form = UserEditForm(obj=user)
        if form.validate_on_submit():
            form.populate_obj(user)
            session.commit()
            return redirect("/")

        if form.errors:
            log.warn("Form contained errors", errors=form.errors)

        return render_template("auth/user_edit.html", form=form, user=user)

    client.login_session(author.email)

    with client.get(f"/user/{author.id}/edit/") as resp:
        assert resp == Ok()

    with client.post(f"/user/{author.id}/edit/", data={"email": "hello@bss.net"}) as resp:
        assert resp == Redirect("/"), "Edit success should redirect to /"
