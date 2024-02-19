from typing import Any
from unittest.mock import Mock

import pytest
import svcs.flask
from basingse.auth.models import User
from basingse.auth.permissions import Action
from basingse.auth.permissions import create_administrator
from basingse.auth.permissions import Permission
from basingse.auth.permissions import PermissionGrant
from basingse.auth.permissions import require_permission
from basingse.auth.permissions import Role
from flask import Flask
from flask_login import LoginManager
from sqlalchemy import select
from sqlalchemy.orm import Session


@pytest.mark.usefixtures("extension", "engine")
def test_setup_administrator(app: Flask) -> None:
    with app.app_context():
        user = create_administrator("admin@basingse.test", "password")
        assert user is not None
        assert user.email == "admin@basingse.test"
        assert user.compare_password("password")
        assert user.is_administrator


@pytest.mark.usefixtures("extension", "engine")
def test_setup_existing_user_administrator(app: Flask, author: User) -> None:
    with app.app_context():
        user = create_administrator(author.email, "password")  # type: ignore
        assert user is not None
        assert user.email == author.email
        assert user.compare_password("password")
        assert user.is_administrator


@pytest.mark.usefixtures("extension", "engine")
def test_setup_existing_role_administrator(app: Flask, author: User, session: Session) -> None:
    role = Role(name="admin", administrator=True)
    session.add(role)
    session.commit()

    with app.app_context():
        user = create_administrator(author.email, "password")  # type: ignore
        assert user is not None
        assert user.email == author.email
        assert user.compare_password("password")
        assert user.is_administrator
        assert role in user.roles


@pytest.mark.usefixtures("extension", "engine")
def test_setup_existing_administrator(app: Flask, author: User, session: Session) -> None:
    role = Role(name="admin", administrator=True)
    session.add(role)
    session.commit()

    with app.app_context():
        user = create_administrator("hello@example.com", "password")
        assert user.is_administrator

    with app.app_context():
        user = create_administrator(author.email, "password")  # type: ignore
        assert not user.is_administrator


@pytest.mark.usefixtures("extension", "engine")
def test_grant_permissions(app: Flask) -> None:
    with app.app_context():
        editor = Role(name="editor")
        editor.grant(("post", Action.EDIT))
        editor.grant(("post", Action.EDIT))

        assert len(editor.permissions) == 1

        session = svcs.flask.get(Session)
        session.add(editor)
        session.commit()

    with app.app_context():
        session = svcs.flask.get(Session)
        role = session.execute(select(Role).where(Role.name == "editor")).scalar_one()
        assert role.can(("post", Action.EDIT))

    with app.app_context():
        session = svcs.flask.get(Session)
        role = session.execute(select(Role).where(Role.name == "editor")).scalar_one()
        role.revoke(("post", Action.EDIT))
        session.commit()

    with app.app_context():
        session = svcs.flask.get(Session)
        role = session.execute(select(Role).where(Role.name == "editor")).scalar_one()
        assert not role.can(Permission(model="post", action="edit"))


def test_reprs() -> None:
    assert repr(Role(name="editor")) == "<Role editor>"
    assert repr(Role(name="admin", administrator=True)) == "<Role admin (administrator)>"
    assert repr(Permission(model="user", action="edit")) == "<Permission user.edit>"
    assert repr(PermissionGrant(model="user", action=Action.EDIT)) == "<PermissionGrant user.edit>"


class Unauthorized(Exception):
    pass


@pytest.fixture
def login_manager(app: Flask, extension: Any) -> LoginManager:
    def unauthorized() -> None:
        raise Unauthorized()

    with app.app_context():
        extension.login_manager.unauthorized_handler(unauthorized)  # type: ignore
        return extension.login_manager


@pytest.fixture
def author(app: Flask, engine: Any, user: Any) -> User:
    user = user("author")
    with app.app_context():
        session = svcs.flask.get(Session)
        role = session.execute(select(Role).where(Role.name == "author")).scalar_one()
        role.grant("post", Action.EDIT)
        session.add(role)
        session.commit()
    return user


@pytest.mark.usefixtures("secure", "login_manager")
def test_require_permissions(app: Flask, author: User) -> None:
    view = Mock()

    with app.test_request_context("/"):
        session = svcs.flask.get(Session)
        User.login(session, author.email, "badpassword")
        require_permission("post", Action.EDIT)(view)()

    view.assert_called_once()


@pytest.mark.usefixtures("secure", "author", "login_manager")
def test_require_permissions_unauthenticated(app: Flask) -> None:
    view = Mock()

    with app.test_request_context("/"):
        with pytest.raises(Unauthorized):
            require_permission("post", Action.EDIT)(view)()
        assert not view.called


@pytest.mark.usefixtures("secure", "login_manager")
def test_require_permissions_unauthorized(app: Flask, author: User) -> None:
    view = Mock()
    with app.test_request_context("/"):
        session = svcs.flask.get(Session)
        User.login(session, author.email, "badpassword")
        with pytest.raises(Unauthorized):
            require_permission("post", Action.DELETE)(view)()
        assert not view.called


@pytest.mark.usefixtures("author")
def test_attributes(app: Flask) -> None:
    with app.test_request_context("/"):
        session = svcs.flask.get(Session)
        author = session.execute(select(User)).scalar_one()

        assert not author.is_anonymous
        assert author.is_authenticated

        assert author.can("post", Action.EDIT)
        assert not author.can("post", Action.DELETE)
        assert author.can(Permission(model="post", action="edit"))