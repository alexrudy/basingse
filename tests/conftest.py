import dataclasses as dc
import logging
from collections.abc import Iterator
from pathlib import Path
from typing import Any
from typing import cast

import pytest
import structlog
from flask import Flask
from flask import request
from flask import request_finished
from flask import request_started
from jinja2 import FileSystemLoader
from jinja2 import Template
from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlalchemy.engine.interfaces import DBAPIConnection
from sqlalchemy.pool import ConnectionPoolEntry
from structlog.types import EventDict

from basingse import svcs
from basingse.app import configure_app
from basingse.assets import AssetManifest
from basingse.auth.testing import LoginClient
from basingse.logging import log_queries
from basingse.models import Model
from basingse.settings import BaSingSe
from basingse.testing.responses import assertrepr_compare as responses_assertrepr_compare


logger = structlog.get_logger()


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption("--log-queries", action="store_true", help="Log all queries")


def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line("markers", "flask: mark test as flask utility")


def pytest_assertrepr_compare(config: Any, op: str, left: Any, right: Any) -> list[str] | None:
    return responses_assertrepr_compare(config, op, left, right)


@pytest.fixture(autouse=True, scope="session")
def setup_svcs_logging() -> None:
    svcs_logger = logging.getLogger("svcs")
    svcs_logger.addHandler(logging.NullHandler())
    svcs_logger.propagate = False


@pytest.fixture(autouse=True, scope="session")
def setup_query_logging(request: pytest.FixtureRequest) -> None:
    if request.config.getoption("--log-queries"):
        event.listen(Engine, "before_cursor_execute", log_queries)

        @event.listens_for(Engine, "commit")
        def receive_commit(conn: Any) -> None:
            logger.debug("COMMIT", engine=conn.engine.url)

        @event.listens_for(Engine, "connect")
        def connect(dbapi_connection: DBAPIConnection, connection_record: ConnectionPoolEntry) -> None:
            logger.debug("connecting")


def setup_app_logging(app: Flask) -> None:
    @request_started.connect_via(app)
    def log_request_started(sender: Any, **kwargs: Any) -> None:
        sender.logger.debug(request.method, path=request.path)

    @request_finished.connect_via(app)
    def log_request_finished(sender: Any, response: Any, **kwargs: Any) -> None:
        sender.logger.debug(response.status_code, path=request.path)


@pytest.fixture(scope="function")
def app(tmp_path: Path) -> Iterator[Flask]:
    import glob
    from werkzeug.utils import cached_property
    from jinja2.loaders import BaseLoader

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

    app = TestingFlask(__name__)
    app.test_client_class = LoginClient
    configure_app(app, config={"ENV": "test", "ASSETS_FOLDER": None, "ATTACHMENTS_CACHE_DIRECTORY": str(tmp_path)})
    bss = BaSingSe(logging=None)  # type: ignore
    bss.init_app(app)
    assert bss.assets, "Assets should be initialized"
    bss.assets.add(AssetManifest(location="tests"))

    setup_app_logging(app)

    with app.app_context():
        engine = svcs.get(Engine)
        Model.metadata.create_all(engine)

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


_LOG_RECORD_KEYS = set(logging.LogRecord("name", 0, "pathname", 0, "msg", (), None).__dict__.keys()) - {"name"}
_LOG_METHOD_ARGS = {"args", "exc_info", "extra", "stack_info"}


def render_to_log_kwargs(logger: logging.Logger, name: str, event_dict: EventDict) -> EventDict:
    msg = event_dict.pop("event", "")
    msg = f"{msg!s} " + " ".join(
        f"{k}={event_dict.pop(k)!r}" for k in list(event_dict.keys()) if k not in _LOG_METHOD_ARGS
    )

    return {"msg": msg, **event_dict}


@pytest.fixture(autouse=True)
def configure_structlog() -> None:
    import structlog

    structlog.configure(
        processors=[
            structlog.stdlib.filter_by_level,
            structlog.stdlib.add_logger_name,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.processors.UnicodeDecoder(),
            render_to_log_kwargs,
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )


@dc.dataclass
class TemplateRendered:
    template: Template
    context: dict[str, Any]


class TemplatesFixture:
    def __init__(self) -> None:
        self.templates: list[TemplateRendered] = []

    def template_rendered(self, app: Flask, template: Template, context: dict[str, Any], **extra: Any) -> None:
        self.templates.append(TemplateRendered(template, context))

    def __getitem__(self, index: int) -> TemplateRendered:
        return self.templates[index]

    def __len__(self) -> int:
        return len(self.templates)


@pytest.fixture
def templates() -> Iterator[TemplatesFixture]:
    from flask import template_rendered

    fixture = TemplatesFixture()

    template_rendered.connect(fixture.template_rendered)

    yield fixture

    template_rendered.disconnect(fixture.template_rendered)
