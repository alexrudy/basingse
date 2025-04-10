import logging
from collections.abc import Iterator
from pathlib import Path
from typing import cast

import click.testing
import pytest
import structlog
from blinker import Signal
from flask import Flask
from jinja2 import FileSystemLoader
from sqlalchemy import Engine

from basingse import svcs
from basingse.app import configure_app
from basingse.assets import AssetManifest
from basingse.assets import Assets
from basingse.auth.testing import LoginClient
from basingse.models import Model
from basingse.settings import BaSingSe

init_app = Signal("Fires when an app is started")


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line("markers", "flask: mark test as flask utility")


@pytest.fixture()
@pytest.mark.flask
def app(tmp_path: Path, request: pytest.FixtureRequest) -> Iterator[Flask]:
    import glob

    from jinja2.loaders import BaseLoader
    from werkzeug.utils import cached_property

    class TestingFlask(Flask):
        def __repr__(self) -> str:
            return f"<TestingFlask {self.import_name} {id(self)}>"

        @cached_property
        def jinja_loader(self) -> BaseLoader | None:
            """Override the jinja loader to look through all test folders"""
            assert self.template_folder is not None, "Template folder must be set"
            return FileSystemLoader(
                [str(self.template_folder)] + glob.glob(self.root_path + "/**/templates", recursive=True)
            )

        @property
        def logger(self) -> logging.Logger:  # type: ignore
            return structlog.get_logger("test.app")

    app = TestingFlask(__name__, root_path=str(request.config.rootdir))
    app.test_client_class = LoginClient
    configure_app(
        app,
        config={
            "ENV": "test",
            "ASSETS_FOLDER": None,
            "ATTACHMENTS_CACHE_DIRECTORY": str(tmp_path),
        },
    )

    print(app.root_path)

    bss = BaSingSe(all=True).disable("logging", "autoimport")
    bss.init_app(app)
    assets = cast(Assets, bss.assets)
    assets.add(AssetManifest(location="tests"))

    init_app.send(app)

    with app.app_context():
        engine = svcs.get(Engine)
        Model.metadata.create_all(engine)

    if request.config.getoption("--show-routes"):
        from flask.cli import FlaskGroup

        runner = click.testing.CliRunner()
        cli = FlaskGroup(create_app=lambda: app)
        result = runner.invoke(cli, "routes")
        print(result.output)

    yield app

    svcs.close_registry(app)


@pytest.fixture
def app_context(app: Flask) -> Iterator[None]:
    with app.app_context():
        yield None


@pytest.fixture
def client(app: Flask) -> Iterator[LoginClient]:
    with app.test_client() as client:
        yield cast(LoginClient, client)
