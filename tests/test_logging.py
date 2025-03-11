import contextlib
import dataclasses as dc
import logging
from typing import Any

import pytest
import structlog.contextvars
from flask import Flask
from flask import g

from basingse.logging import bind_request_details
from basingse.logging import bind_user_details
from basingse.logging import DebugDemoter
from basingse.logging import RequestInfo


@dc.dataclass
class User:
    id: int = 1
    is_authenticated: bool = False

    def get_id(self) -> int:
        return self.id


class LoginManager:
    def _load_user(self) -> None:
        g._login_user = User()


@pytest.fixture
def app() -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "testing"
    app.config["DEBUG"] = True
    app.config["SERVER_NAME"] = "localhost"
    app.debug = True

    @app.get("/")
    def home() -> str:
        return "Welcome Home!"

    return app


@pytest.fixture
def auth(app: Flask) -> None:
    app.login_manager = LoginManager()  # type: ignore[attr-defined]


@pytest.mark.parametrize(
    "event, debug, expected_level",
    [
        pytest.param(
            {"level": logging.DEBUG, "debug": True},
            True,
            logging.DEBUG,
            id="no-op demote",
        ),
        pytest.param({"level": logging.DEBUG, "debug": True}, False, logging.DEBUG, id="no-op"),
        pytest.param(
            {"level": logging.WARNING, "debug": True},
            False,
            logging.DEBUG,
            id="warn-debug",
        ),
        pytest.param(
            {"level": logging.WARNING, "debug": True},
            True,
            logging.WARNING,
            id="warn-warn",
        ),
        pytest.param(
            {"level": logging.INFO, "debug": True},
            False,
            logging.DEBUG,
            id="info-debug",
        ),
        pytest.param(
            {"level": logging.INFO, "debug": False},
            False,
            logging.INFO,
            id="info-nodebug",
        ),
        pytest.param({"level": logging.INFO}, False, logging.INFO, id="info-missingdebug"),
        pytest.param({"level": logging.INFO, "debug": True}, None, logging.INFO, id="info-no-app"),
    ],
)
def test_debug_demoter(app: Flask, event: dict[str, Any], debug: bool, expected_level: str) -> None:
    demoter = DebugDemoter()

    with contextlib.ExitStack() as stack:
        if debug is not None:
            app.debug = debug
            stack.enter_context(app.app_context())

        processed = demoter(None, "info", event)
        assert processed["level"] == expected_level


@pytest.mark.parametrize(
    "request_args, attributes",
    [
        pytest.param(
            {},
            {
                "id": None,
                "peer": None,
                "path": "/",
                "host": "localhost",
                "method": "GET",
            },
            id="simple",
        ),
        pytest.param(
            {"headers": {"X-Unique-ID": "123", "X-Forwarded-For": "10.0.0.1"}},
            {"peer": "10.0.0.1", "id": "123"},
            id="headers",
        ),
    ],
)
def test_request_info(app: Flask, request_args: dict[str, Any], attributes: dict[str, Any]) -> None:
    with app.test_request_context("/", **request_args):
        info = RequestInfo.build()
        for name, expected in attributes.items():
            assert getattr(info, name) == expected


@pytest.mark.usefixtures("auth")
def test_request_contextvars(app: Flask) -> None:
    with app.test_request_context("/"):
        bind_request_details(app)
        vars = structlog.contextvars.get_contextvars()
        assert vars["request"].path == "/"
        assert "user" not in vars


@pytest.mark.usefixtures("auth")
def test_request_contextvars_user(app: Flask) -> None:
    with app.test_request_context("/"):
        bind_request_details(app)
        g._login_user = user = User(is_authenticated=True)
        bind_user_details(app, user)
        vars = structlog.contextvars.get_contextvars()
        assert vars["user"] == 1
