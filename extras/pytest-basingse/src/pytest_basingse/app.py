import logging
from collections.abc import Iterator
from operator import itemgetter
from pathlib import Path
from typing import Any
from typing import cast

import click.testing
import pytest
import rich.table
import structlog
from blinker import Signal
from flask import Flask
from jinja2 import FileSystemLoader
from pytest import hookimpl
from pytest import Item
from rich.console import Console
from sqlalchemy import Engine

from basingse import svcs
from basingse.app import configure_app
from basingse.assets import AssetManifest
from basingse.assets import Assets
from basingse.auth.testing import LoginClient
from basingse.models import Model
from basingse.settings import BaSingSe

init_app = Signal("Fires when an app is started")


def pytest_addoption(parser):
    group = parser.getgroup("flask")
    group.addoption(
        "--flask-show-routes", action="store_true", help="Show URL routes for the flask app fixture", default=False
    )
    group.addoption(
        "--flask-show-config",
        action="store_true",
        help="Show configuration values for the flask app fixture",
        default=False,
    )


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line("markers", "flask: mark test as flask utility")


@pytest.fixture()
@pytest.mark.flask
def app(tmp_path: Path, request: pytest.FixtureRequest) -> Iterator[Flask]:
    import glob

    from flask.sansio.blueprints import Blueprint
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

        def register_blueprint(self, blueprint: Blueprint, **options: Any) -> None:
            self.logger.info(f"Registering {blueprint.name}", url=blueprint.url_prefix)  # type: ignore
            super().register_blueprint(blueprint, **options)

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


@hookimpl(wrapper=True)
def pytest_runtest_call(item: Item):
    add_flask_reports(item)
    return (yield)


def add_flask_reports(item: Item) -> None:
    info = getattr(item, "_fixtureinfo", None)
    if info is None or not info.name2fixturedefs:
        # This test item does not use any fixtures.
        return

    if "app" not in info.name2fixturedefs:
        # This test item does not use the flask app.
        return

    for fixturedef in info.name2fixturedefs["app"]:
        if fixturedef.cached_result is not None:
            flask_app = fixturedef.cached_result[0]
            break
    else:
        return

    item.add_report_section("setup", "flask", show_flask_info(flask_app))

    if item.config.getoption("flask_show_routes"):
        item.add_report_section("setup", "flask-routes", show_routes(flask_app))

    if item.config.getoption("flask_show_config"):
        item.add_report_section("setup", "flask-config", show_config(flask_app))


def show_flask_info(app: Flask) -> str:
    return "{app} {name} {root}".format(
        app=click.style("app", bold=True), name=click.style(app.name, bold=True, fg="cyan"), root=app.root_path
    )


def show_config(app: Flask) -> str:
    rows = []
    for entry, value in app.config.items():
        rows.append("  {entry}: {value}".format(entry=click.style(entry, bold=True, fg="yellow"), value=repr(value)))

    return "\n".join(rows)


def show_routes(app: Flask, *, sort: str = "endpoint", all_methods: bool = False) -> str:
    rules = list(app.url_map.iter_rules())

    if not rules:
        return "No routes were registered."

    ignored_methods = set() if all_methods else {"HEAD", "OPTIONS"}
    host_matching = app.url_map.host_matching
    has_domain = any(rule.host if host_matching else rule.subdomain for rule in rules)
    rows = []

    for rule in rules:
        row = [
            rule.endpoint,
            ", ".join(sorted((rule.methods or set()) - ignored_methods)),
        ]

        if has_domain:
            row.append((rule.host if host_matching else rule.subdomain) or "")

        row.append(rule.rule)
        rows.append(row)

    headers = ["Endpoint", "Methods"]
    sorts = ["endpoint", "methods"]

    if has_domain:
        headers.append("Host" if host_matching else "Subdomain")
        sorts.append("domain")

    headers.append("Rule")
    sorts.append("rule")

    try:
        rows.sort(key=itemgetter(sorts.index(sort)))
    except ValueError:
        pass

    tbl = rich.table.Table(*headers)

    for items in rows:
        tbl.add_row(*items)

    console = Console(width=220)
    with console.capture() as cap:
        console.print(tbl)

    return cap.get()
