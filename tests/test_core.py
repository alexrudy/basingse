import pytest
from flask import Flask

from basingse.app import configure_app
from basingse.auth.testing import LoginClient


def test_home(client: LoginClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert b"Welcome Home!" in response.data


def test_configure_app(app: Flask, monkeypatch: pytest.MonkeyPatch) -> None:
    assert app.config["SECRET_KEY"], "Expected a secret key to be set"

    monkeypatch.setenv("DOESNOTEXIST_SIGNAL", "signal")
    configure_app(app, config=None, prefix="DOESNOTEXIST")
    assert app.config["SIGNAL"] == "signal"


def test_healthcheck(client: LoginClient) -> None:
    response = client.get("/healthcheck")
    assert response.status_code == 200
    assert response.json is not None, "Expected JSON response"
    available = set(response.json["ok"])
    assert "sqlalchemy.engine.base.Engine" in available

    failing = set(response.json["failing"])
    assert not failing


def test_model_cli(app: Flask) -> None:
    from basingse.models import init

    runner = app.test_cli_runner()
    result = runner.invoke(init)

    assert result.exit_code == 0, result.output
