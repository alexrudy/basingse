import functools

import pytest
from flask import Flask
from pytest_basingse.templates import TemplatesFixture
from sqlalchemy.orm import Session

from .auth.conftest import user  # noqa: F401
from basingse import svcs
from basingse.app import configure_app
from basingse.auth.models import User
from basingse.auth.testing import LoginClient
from basingse.customize.models import SiteSettings
from basingse.customize.services import get_site_settings


@pytest.fixture
def no_homepage(app: Flask) -> None:
    with app.app_context():
        settings = get_site_settings()
        session = svcs.get(Session)
        settings = session.get(SiteSettings, settings.id)
        assert settings is not None, "No site settings found"
        settings.homepage = None  # type: ignore
        session.commit()


@pytest.fixture
def unhealthy_service(app: Flask) -> None:
    class FailingService:
        name = "FailingService"

        def ping(self) -> None:
            raise ValueError("Failing")

    svcs.register_value(app, FailingService, FailingService(), ping=lambda fs: fs.ping())


def test_home(client: LoginClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert b"Welcome Home!" in response.data


def test_core_assets(client: LoginClient, templates: TemplatesFixture) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert b"Welcome Home!" in response.data
    # assert b'<link href="/assets/basingse/css/basingse.main.css" rel="stylesheet">' in response.data

    record = templates[-1]
    assert record.template.name == "page.html"
    assert record.context["page"].title == "Home"
    assert "assets" in record.context

    assert len(list(record.context["assets"].iter_assets("basingse", "js"))) >= 1


@pytest.mark.usefixtures("no_homepage")
def test_home_not_found(client: LoginClient) -> None:
    response = client.get("/")
    assert response.status_code == 404
    assert b"not found" in response.data


@pytest.mark.usefixtures("no_homepage")
def test_home_not_found_authenticated(client: LoginClient, user: functools.partial[User]) -> None:  # noqa: F811
    user = user("admin")
    client.login_session(user.email)
    response = client.get("/")
    assert response.status_code == 404
    assert b"not found" in response.data


def test_configure_app(app: Flask, monkeypatch: pytest.MonkeyPatch) -> None:
    assert app.config["SECRET_KEY"], "Expected a secret key to be set"

    monkeypatch.setenv("DOESNOTEXIST_SIGNAL", "signal")
    configure_app(app, config=None, prefix="DOESNOTEXIST")
    assert app.config["SIGNAL"] == "signal"


def test_healthcheck(client: LoginClient) -> None:
    response = client.get("/healthcheck")
    assert response.status_code == 200
    assert response.json is not None, "Expected JSON response"
    available = {key for key, value in response.json.items() if value["status"] == "ok"}
    assert "sqlalchemy.engine.base.Engine" in available

    failing = {key for key, value in response.json.items() if value["status"] != "ok"}
    assert not failing


@pytest.mark.usefixtures("unhealthy_service")
def test_failing_healthcheck(client: LoginClient) -> None:
    response = client.get("/healthcheck")
    assert response.status_code == 500
    assert response.json is not None, "Expected JSON response"
    available = {key for key, value in response.json.items() if value["status"] == "ok"}
    assert "sqlalchemy.engine.base.Engine" in available

    failing = {key for key, value in response.json.items() if value["status"] != "ok"}

    assert "tests.test_core.unhealthy_service.<locals>.FailingService" in failing


def test_model_cli(app: Flask) -> None:
    from basingse.models import init

    runner = app.test_cli_runner()
    result = runner.invoke(init)

    assert result.exit_code == 0, result.output
