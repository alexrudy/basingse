import datetime as dt
import uuid
from typing import Any
from urllib.parse import parse_qs
from urllib.parse import urlsplit as url_parse

import freezegun
import pytest
import pytz
import structlog
import svcs
from basingse.auth.models import User
from basingse.auth.models import UserSchema
from basingse.auth.testing import LoginClient
from basingse.auth.testing import Ok
from basingse.auth.testing import Redirect
from basingse.auth.testing import Unauthorized
from basingse.auth.utils import serializer
from flask import Flask
from flask import get_flashed_messages
from flask_login import current_user
from sqlalchemy.orm import Session

log = structlog.get_logger(__name__)


@pytest.fixture
def admin(user: Any) -> User:
    return user("admin")


@pytest.fixture
def author(user: Any) -> User:
    return user("author")


@pytest.mark.usefixtures("secure")
def test_login_logout(admin: User, client: LoginClient) -> None:
    # Not logged in, geth the login form
    resp = client.get("/auth/login/")
    assert resp == Ok()

    # Successful login
    resp = client.post("/auth/login/", data={"email": admin.email, "password": "badpassword"})
    assert resp == Redirect("/"), "Login should redirect to /"

    # Already logged in, redirect
    resp = client.get("/auth/login/")
    assert resp == Redirect("/"), "Logged-in should redirect to /"

    assert current_user.is_authenticated

    # Logout
    resp = client.get("/auth/logout/")
    assert resp == Redirect("/auth/login/"), "Logout should redirect to /auth/login/"
    assert not current_user.is_authenticated


@pytest.mark.usefixtures("secure")
def test_login_dev_logout(author: User, client: LoginClient) -> None:
    client.login_session(author.email)  # type: ignore
    assert current_user.is_authenticated

    client.logout()
    assert not current_user.is_authenticated


@pytest.mark.usefixtures("secure")
def test_login_dev_not_testing(author: User, client: LoginClient, app: Flask) -> None:
    app.testing = False
    with client.post("/auth/testing/login/", follow_redirects=True, json={"email": author.email}) as resp:
        assert resp == Unauthorized()
        assert not current_user.is_authenticated


@pytest.mark.usefixtures("secure")
def test_login_dev_production(author: User, client: LoginClient, app: Flask) -> None:
    app.config["ENV"] = "production"
    with client.post("/auth/testing/login/", follow_redirects=True, json={"email": author.email}) as resp:
        assert resp == Unauthorized()
        assert not current_user.is_authenticated


@pytest.mark.usefixtures("secure")
def test_dev_login_unknown_user(author: User, client: LoginClient) -> None:
    with client.post("/auth/testing/login/", follow_redirects=True, json={"email": "hello@example.com"}) as resp:
        assert resp.status_code == 404
        assert not current_user.is_authenticated


@pytest.mark.usefixtures("secure")
def test_dev_login_inactive_user(session: Session, author: User, client: LoginClient) -> None:
    author.active = False
    session.add(author)
    session.commit()

    with client.post("/auth/testing/login/", follow_redirects=True, json={"email": author.email}) as resp:
        assert resp == Unauthorized()
        assert not current_user.is_authenticated


@pytest.mark.usefixtures("secure")
def test_login_logout_redirects(author: User, client: LoginClient) -> None:
    resp = client.get("/")
    assert resp == Ok()
    assert not current_user.is_authenticated

    resp = client.login(
        author.email, "notpassword", query_string=dict(next=str(serializer().dumps("/some/funky/url/")))
    )
    assert not current_user.is_authenticated
    assert parse_qs(url_parse(resp.location).query)["next"][0] == serializer().dumps("/some/funky/url/")

    resp = client.login(author.email, "badpassword")
    assert current_user.is_authenticated
    client.logout()
    assert not current_user.is_authenticated


@pytest.mark.usefixtures("secure")
def test_login_logout_client(author: User, client: LoginClient) -> None:
    resp = client.get("/")

    assert resp == Ok()

    assert not current_user.is_authenticated
    client.login(author.email, "badpassword")
    assert current_user.is_authenticated
    client.logout()
    assert not current_user.is_authenticated


@pytest.mark.usefixtures("secure")
def test_login_failure_not_active(author: User, client: LoginClient, session: Session) -> None:
    author.active = False
    session.add(author)
    session.commit()

    resp = client.get("/")

    assert resp == Ok()

    assert not current_user.is_authenticated
    client.login(author.email, "badpassword")
    assert not current_user.is_authenticated


@pytest.mark.usefixtures("secure")
def test_change_password(session: Session, author: User, client: LoginClient) -> None:
    client.login_session(author.email)  # type: ignore

    resp = client.get("/auth/password/")
    assert resp == Ok()

    with client.post(
        "/auth/password/",
        data={"old_password": "goodpassword", "new_password": "worsepassword", "confirm": "worsepassword"},
    ) as resp:
        assert resp == Ok()
        msgs = get_flashed_messages()
        assert len(msgs) == 1
        assert msgs[0] == "Incorrect current password"

    client.post(
        "/auth/password/",
        data={"old_password": "badpassword", "new_password": "worsepassword", "confirm": "worsepassword"},
    )

    session.add(author)
    session.refresh(author)
    assert not author.compare_password("badpassword")
    assert author.compare_password("worsepassword")


@pytest.mark.usefixtures("extension", "engine")
def test_user_not_found(client: LoginClient) -> None:
    with client.get(f"/auth/user/{uuid.uuid4()!s}/activate") as resp:
        assert resp.status_code == 404


@pytest.mark.usefixtures("secure")
def test_remove_password(session: Session, author: User, client: LoginClient) -> None:
    author.password = None
    session.add(author)
    session.commit()

    client.post("/auth/login/", data={"email": author.email, "password": "badpassword"})
    assert not current_user.is_authenticated


@pytest.mark.usefixtures("secure")
def test_user_attributes(session: Session, author: User, client: LoginClient) -> None:
    session.add(author)
    author.email = "test-user@basingse.test"  # type: ignore
    assert author.last_login_at == None
    session.commit()

    with freezegun.freeze_time("2022-08-02 12:15:00"):
        client.login_session(author.email)  # type: ignore

    session.refresh(author)
    assert author.last_login_at == pytz.utc.localize(dt.datetime(2022, 8, 2, 12, 15))
    assert author.displayname == "test-user@basingse.test"


@pytest.mark.usefixtures("secure")
def test_user_activate_endpoints(session: Session, author: User, admin: User, client: LoginClient) -> None:
    session.add(author)
    session.commit()
    assert author.is_active

    client.login_session(admin.email)  # type: ignore

    log.info("GET /activate", user=author, active=author.is_active)
    with client.get(f"/auth/user/{author.id}/activate") as resp:
        assert resp == Redirect("/"), "/activate should redirect to /"
        session.refresh(author)
        assert author.is_active, "User should be active"

    log.info("GET /deactivate", user=author, active=author.is_active)
    with client.get(f"/auth/user/{author.id}/deactivate") as resp:
        assert resp == Redirect("/"), "/deactivate should redirect to /"
        session.refresh(author)
        assert not author.is_active, "User should be deactivated"

    log.info("GET /activate", user=author, active=author.is_active)
    with client.get(f"/auth/user/{author.id}/activate") as resp:
        assert resp == Redirect("/"), "/activate should redirect to /"
        session.refresh(author)
        assert author.is_active, "User should be active"


@pytest.mark.usefixtures("secure")
def test_me_endpoint(author: User, client: LoginClient) -> None:
    client.login_session(author.email)  # type: ignore

    with client.get("/auth/me", headers={"accept": "application/json"}) as resp:
        assert resp == Ok()
        assert resp.json["id"] == str(author.id), "User should be the same"  # type: ignore

    with client.get("/auth/me", headers={"accept": "text/html"}) as resp:
        assert resp == Redirect("/")  # type: ignore


@pytest.mark.usefixtures("secure")
def test_user_reset_session(author: User, admin: User, app: Flask) -> None:
    with app.test_client(use_cookies=True) as author_client:
        author_client.login(author.email, "badpassword")  # type: ignore
        with author_client.get("/auth/me") as resp:
            assert resp == Ok()
            assert resp.json["id"] == str(author.id), "User should be the same"  # type: ignore
            assert current_user.id == author.id, "Author should be logged in"
            assert current_user.is_authenticated, "User should be logged in"

        session_cookie = author_client.get_cookie("session", domain="basingse.test")
        assert session_cookie is not None, "Session cookie should be set"

    with app.test_client(use_cookies=True) as author_client:
        author_client.set_cookie("session", session_cookie.value, domain="basingse.test")
        with author_client.get("/auth/me", headers={"accept": "application/json"}) as resp:
            assert resp == Ok()
            assert current_user.is_authenticated, "Session should preserved, user should be logged in"
            assert resp.json["id"] == str(author.id), "User should be the same"  # type: ignore

    with app.test_client(use_cookies=True) as admin_client:
        admin_client.login_session(admin.email)  # type: ignore
        log.info("GET /reset-session", user=author)
        with admin_client.get(f"/auth/user/{author.id}/reset-session/") as resp:
            assert resp == Redirect("/"), "/reset-session should redirect to /profile/"
        admin_client.logout()  # type: ignore

    log.info("Request for author", user=author)
    with app.test_client(use_cookies=True) as author_client:
        author_client.set_cookie("session", session_cookie.value, domain="basingse.test")

        with author_client.get("/auth/me", headers={"accept": "application/json"}) as resp:
            assert resp == Redirect("/auth/login/"), "Session should be reset, user should be logged out"
            assert not current_user.is_authenticated, "Session should be reset, user should be logged out"


@pytest.mark.usefixtures("secure")
def test_login_link(author: User, client: LoginClient, app: Flask) -> None:
    with freezegun.freeze_time("2022-08-02 12:15:00"):
        with app.test_request_context():
            link = author.link()
            assert link.startswith("http://basingse.test/auth/login/?token=")

        with client.get(link) as resp:
            assert resp == Redirect("/"), "Login link should redirect to /"
            assert current_user.is_authenticated, "User should be logged in"
            assert current_user.id == author.id, "User should be the same"

        # Link can be used multiple times
        client.logout()
        with client.get(link) as resp:
            assert resp == Redirect("/"), "Login link should redirect to /"
            assert current_user.is_authenticated, "User should be logged in"
            assert current_user.id == author.id, "User should be the same"

    # Expired link can't be used.
    client.logout()
    with freezegun.freeze_time("2023-08-02 12:15:00"):
        with client.get(link) as resp:
            assert resp == Redirect("/auth/login/"), "Login link should redirect to /auth/login/"
            assert not current_user.is_authenticated, "User should be logged out"

    client.logout()
    # Garbage link
    token = "deadbeef"
    with client.get(f"/auth/login/?token={token}") as resp:
        assert resp == Redirect("/auth/login/"), "Login link should redirect to /auth/login/"
        assert not current_user.is_authenticated, "User should be logged out"

    client.logout()

    # Reset the author's token
    with app.app_context():
        session = svcs.flask.get(Session)
        session.get(User, author.id).reset_token()  # type: ignore
        session.commit()

    # Old link can't be used
    with freezegun.freeze_time("2022-08-02 12:15:00"):
        with client.get(link) as resp:
            assert resp == Redirect("/auth/login/"), "Login link should redirect to /auth/login/"
            assert not current_user.is_authenticated, "User should be logged out"

        client.logout()

        with app.app_context():
            session = svcs.flask.get(Session)
            user = session.get(User, author.id)
            assert user is not None
            link = user.link()
            user.active = False
            session.commit()

        # Inactive user can't use the link
        with client.get(link) as resp:
            assert resp == Redirect("/auth/login/"), "Login link should redirect to /auth/login/"
            assert not current_user.is_authenticated, "User should be logged out"
            assert not current_user.is_active, "User should be inactive"


@pytest.mark.parametrize(
    "email, password, success",
    [
        ("author@basingse.test", "badpassword", True),
        ("author@basingse.test", "notpassword", False),
        ("imposter@basingse.test", "badpassword", False),
    ],
)
def test_login_model(app: Flask, session: Session, email: str, password: str, success: bool) -> None:
    with app.app_context():
        user = User(email="author@basingse.test", password="badpassword", active=True)
        session.add(user)
        session.commit()

    with app.test_request_context("/"):
        assert User.login(session, email, password) == success


def test_user_schema() -> None:
    data = {
        "email": "author@basingse.test",
    }

    schema = UserSchema()

    user = schema.load(data)
    assert user.email == "author@basingse.test"
    assert not user.active
