from typing import Any

import pytest
from flask import Flask
from flask.testing import FlaskCliRunner
from sqlalchemy import select
from sqlalchemy.orm import Session

from basingse import svcs
from basingse.auth.cli import auth_cli
from basingse.auth.models import User
from basingse.auth.permissions import Permission
from basingse.auth.permissions import Role


@pytest.fixture
def runner(app: Flask) -> FlaskCliRunner:
    return FlaskCliRunner(app=app)


def test_new_user(runner: FlaskCliRunner, app: Flask) -> None:
    result = runner.invoke(
        auth_cli,
        ["new-user", "--email", "example@basingse.test", "--password", "badpassword"],
    )

    assert result.exit_code == 0

    with app.app_context():
        session = svcs.get(Session)
        user = session.execute(select(User).where(User.email == "example@basingse.test")).scalar_one()
        assert user.compare_password("badpassword")


def test_new_user_update(runner: FlaskCliRunner, app: Flask) -> None:
    with app.app_context():
        session = svcs.get(Session)
        user = User(email="example@basingse.test", password="badpassword")
        session.add(user)
        session.commit()
        role = Role(name="admin")
        session.add(role)
        session.commit()
    result = runner.invoke(
        auth_cli,
        ["new-user", "--email", "example@basingse.test", "--inactive", "--password", "goodpassword", "--role", "admin"],
    )
    assert result.exit_code == 0

    with app.app_context():
        session = svcs.get(Session)
        user = session.execute(select(User).where(User.email == "example@basingse.test")).scalar_one()
        assert not user.active


def test_set_role(runner: FlaskCliRunner, app: Flask) -> None:
    with app.app_context():
        session = svcs.get(Session)
        user = User(email="example@basingse.test", password="badpassword")
        session.add(user)
        session.commit()

        role = Role(name="admin")
        session.add(role)
        session.commit()

    result = runner.invoke(auth_cli, ["role", "--email", "example@basingse.test", "--role", "admin"])
    assert result.exit_code == 0

    with app.app_context():
        session = svcs.get(Session)
        user = session.execute(select(User).where(User.email == "example@basingse.test")).scalar_one()
        assert any(role.name == "admin" for role in user.roles)


def test_set_role_missing_user(runner: FlaskCliRunner, app: Flask) -> None:
    with app.app_context():
        session = svcs.get(Session)
        role = Role(name="admin")
        session.add(role)
        session.commit()

    result = runner.invoke(auth_cli, ["role", "--email", "example@basingse.test", "--role", "admin"])

    assert result.exit_code == 2


def test_set_role_missing_role(runner: FlaskCliRunner, app: Flask) -> None:
    with app.app_context():
        session = svcs.get(Session)
        user = User(email="example@basingse.test", password="badpassword")
        session.add(user)
        session.commit()

    result = runner.invoke(auth_cli, ["role", "--email", "example@basingse.test", "--role", "admin"])

    assert result.exit_code == 2


def test_new_role(runner: FlaskCliRunner, app: Flask) -> None:
    result = runner.invoke(auth_cli, ["new-role", "--name", "admin", "--administrator"])
    assert result.exit_code == 0

    with app.app_context():
        session = svcs.get(Session)
        role = session.execute(select(Role).where(Role.name == "admin")).scalar_one()
        assert role.administrator

    result = runner.invoke(auth_cli, ["new-role", "--name", "admin", "--not-administrator"])
    assert result.exit_code == 0

    with app.app_context():
        session = svcs.get(Session)
        role = session.execute(select(Role).where(Role.name == "admin")).scalar_one()
        assert not role.administrator


def test_grant(runner: FlaskCliRunner, app: Flask) -> None:
    with app.app_context():
        session = svcs.get(Session)
        role = Role(name="admin")
        session.add(role)
        session.commit()

    result = runner.invoke(auth_cli, ["grant", "--role", "admin", "--permission", "edit", "--model", "user"])
    assert result.exit_code == 0

    with app.app_context():
        session = svcs.get(Session)
        role = session.execute(select(Role).where(Role.name == "admin")).scalar_one()
        assert Permission(model="user", action="edit") in role.permissions


def test_activate_user(runner: FlaskCliRunner, app: Flask) -> None:
    with app.app_context():
        session = svcs.get(Session)
        user = User(email="hello@basingse.test", password="badpassword", active=False)
        session.add(user)
        session.commit()

    result = runner.invoke(auth_cli, ["activate", "--email", "hello@basingse.test"])
    assert result.exit_code == 0

    with app.app_context():
        session = svcs.get(Session)
        user = session.execute(select(User).where(User.email == "hello@basingse.test")).scalar_one()
        assert user.active


def test_activate_user_missing(runner: FlaskCliRunner, app: Flask) -> None:
    result = runner.invoke(auth_cli, ["activate", "--email", "foo@hotmail.com"])
    assert result.exit_code == 2


def test_logout_user(runner: FlaskCliRunner, app: Flask) -> None:
    with app.app_context():
        session = svcs.get(Session)
        user = User(email="hello@basingse.test", password="badpassword", active=True)
        session.add(user)
        session.commit()
        session.refresh(user)
        token = user.token

    result = runner.invoke(auth_cli, ["logout", "--email", "hello@basingse.test"])
    assert result.exit_code == 0

    with app.app_context():
        session = svcs.get(Session)
        user = session.execute(select(User).where(User.email == "hello@basingse.test")).scalar_one()
        assert user.token != token


def test_set_password(runner: FlaskCliRunner, app: Flask) -> None:
    with app.app_context():
        session = svcs.get(Session)
        user = User(email="hello@basingse.test", password="badpassword", active=True)
        session.add(user)
        session.commit()

    result = runner.invoke(auth_cli, ["set-password", "--email", "hello@basingse.test", "--password", "sillypassword"])
    assert result.exit_code == 0

    with app.app_context():
        session = svcs.get(Session)
        user = session.execute(select(User).where(User.email == "hello@basingse.test")).scalar_one()
        assert user.compare_password("sillypassword")
        assert not user.compare_password("badpassword")


def test_delete_user(runner: FlaskCliRunner, app: Flask) -> None:
    with app.app_context():
        session = svcs.get(Session)
        user = User(email="hello@basingse.test", password="badpassword", active=True)
        session.add(user)
        session.commit()

    result = runner.invoke(auth_cli, ["delete-user", "--email", "hello@basingse.test"], catch_exceptions=False)
    assert result.exit_code == 0

    result = runner.invoke(auth_cli, ["delete-user", "--email", "hello@basingse.test", "--yes"], catch_exceptions=False)
    assert result.exit_code == 0

    with app.app_context():
        session = svcs.get(Session)
        found = session.execute(select(User).where(User.email == "hello@basingse.test")).scalar_one_or_none()
        assert found is None


@pytest.mark.parametrize(
    "flags, count",
    (
        (["--active"], 2),
        (["--inactive"], 1),
        ([], 3),
        (["--role", "author"], 1),
        (["--administrator"], 1),
        (["--not-administrator"], 2),
    ),
    ids=("active", "inactive", "all", "role", "administrator", "not-administrator"),
)
def test_list_users(runner: FlaskCliRunner, app: Flask, user: Any, flags: list[str], count: int) -> None:
    result = runner.invoke(auth_cli, ["list"])
    assert result.exit_code == 0
    assert result.output == ""

    author = user("author")

    editor = user("editor")
    user("admin")

    with app.test_request_context("/"):
        session = svcs.get(Session)
        author.active = False
        session.merge(author)
        User.login(session, editor.email, "badpassword")
        session.commit()

    result = runner.invoke(auth_cli, ["list"] + flags)
    assert result.exit_code == 0
    assert "badpassword" not in result.output
    assert len(result.output.splitlines()) == count


def test_init_administrator(runner: FlaskCliRunner, app: Flask) -> None:
    result = runner.invoke(auth_cli, ["init", "--email", "admin@basingse.test", "--password", "badpassword"])
    assert result.exit_code == 0

    result = runner.invoke(auth_cli, ["init", "--email", "another@basingse.test", "--password", "badpassword"])
    assert result.exit_code == 0
