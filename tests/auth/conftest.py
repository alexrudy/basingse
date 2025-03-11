import functools
import itertools
from collections.abc import Iterator
from typing import Any
from urllib.parse import urlsplit as url_parse

import pytest
from flask import Flask
from sqlalchemy import select
from sqlalchemy.orm import Session
from werkzeug import Response as WerkzeugResponse

from basingse.auth.models import User
from basingse.auth.testing import Ok
from basingse.auth.testing import Redirect
from basingse.auth.testing import Response
from basingse.auth.testing import Unauthorized


@pytest.fixture
def secure(app: Flask) -> Iterator[None]:
    app.config["LOGIN_DISABLED"] = False
    yield
    app.config["LOGIN_DISABLED"] = True


def create_user(
    role: str,
    *,
    request: Any,
    app: Flask,
    counter: Iterator[int],
) -> User:
    from basingse.auth.models import User
    from basingse.auth.permissions import Role
    from basingse import svcs

    with app.app_context():
        session = svcs.get(Session)
        session.expire_on_commit = False
        user = User(
            email=f"test-{id(request)}-{next(counter)}-{role}@bss.test",
            active=True,
            password="badpassword",
        )

        rr = session.execute(select(Role).where(Role.name == role)).scalar_one_or_none()
        if rr is None:
            rr = Role(name=role)
            session.add(rr)

        if role == "admin":
            rr.administrator = True

        user.roles.append(rr)

        session.add(user)
        session.commit()

    # Reload the user from the database as a clean instance
    return user


@pytest.fixture
def user(app: Flask, request: Any) -> Iterator[functools.partial[User]]:
    counter = itertools.count()
    yield functools.partial(create_user, app=app, request=request, counter=counter)


def pytest_assertrepr_compare(op: str, left: Any, right: Any) -> list[str] | None:
    if not isinstance(right, Response):
        return None

    if not isinstance(left, WerkzeugResponse):
        return None

    if not op == "==":
        return None

    if isinstance(right, Redirect):
        return [
            "expected Redirect:",
            f"  Status: {left.status_code} == {right.status}",
            f"  Location: {url_parse(left.location).path} == {right.url}",
        ]

    if isinstance(right, Unauthorized):
        return [
            "expected Unauthorized:",
            f"  Status: {left.status_code} == {right.status}",
            f"  Location: {left.location}",
        ]

    if isinstance(right, Ok):
        return [
            "expected Ok:",
            f"  Status: {left.status_code} == {right.status}",
            f"  Location: {left.location}",
        ]

    return None
