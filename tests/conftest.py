import logging
from collections.abc import Iterator
from typing import Any
from typing import cast

import pytest
from basingse import svcs
from basingse.auth.testing import LoginClient
from flask import Flask
from jinja2 import FileSystemLoader
from sqlalchemy import create_engine
from sqlalchemy import event
from sqlalchemy import text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import registry as Registry
from sqlalchemy.orm import Session
from structlog.types import EventDict


#: Global registry for SQLAlchemy models.
global_registry = Registry()


@pytest.fixture(autouse=True, scope="session")
def log_engine_queries() -> None:
    logger = logging.getLogger(__name__)

    def log_queries(
        conn: Any, cursor: Any, statement: str, parameters: dict[str, Any], context: Any, executemany: Any
    ) -> None:
        logger.debug("%s parameters=%r", statement, parameters)

    event.listen(Engine, "before_cursor_execute", log_queries)


@pytest.fixture(autouse=True, scope="session")
def setup_svcs_logging() -> None:
    svcs_logger = logging.getLogger("svcs")
    svcs_logger.addHandler(logging.NullHandler())
    svcs_logger.propagate = False


#: Global registry for SQLAlchemy models.
global_registry = Registry()


@pytest.fixture
def registry(app: Flask) -> Iterator[Registry]:
    yield global_registry


@pytest.fixture()
def engine(app: Flask, registry: Registry) -> Iterator[Engine]:
    engine = create_engine(app.config["SQLALCHEMY_DATABASE_URI"])

    has_setup_run = False

    def get_session() -> Session:
        nonlocal has_setup_run
        if not has_setup_run:
            registry.metadata.create_all(engine)
            has_setup_run = True
        return Session(bind=engine)

    svcs.register_factory(
        app,
        Session,
        get_session,
        ping=lambda session: session.execute(text("SELECT 1")).scalar_one(),
        on_registry_close=engine.dispose,
    )

    yield engine


@pytest.fixture
def app() -> Iterator[Flask]:
    import glob
    from werkzeug.utils import cached_property
    from jinja2.loaders import BaseLoader

    class TestingFlask(Flask):
        @cached_property
        def jinja_loader(self) -> BaseLoader | None:
            """Override the jinja loader to look through all test folders"""
            assert self.template_folder is not None
            return FileSystemLoader(
                [str(self.template_folder)] + glob.glob(self.root_path + "/**/templates", recursive=True)
            )

    app = TestingFlask(__name__)
    app.test_client_class = LoginClient
    app.config.update(
        {
            "TESTING": True,
            "DEBUG": False,
            "LOGIN_DISABLED": True,
            "WTF_CSRF_ENABLED": False,
            "BCRYPT_LOG_ROUNDS": 4,  # Make passwords less secure
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SERVER_NAME": "basingse.test",
            "SECRET_KEY": "lake laogai",
        }
    )

    svcs.init_app(app)

    @app.route("/")
    def home() -> str:
        return "Hello, world!"

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


_LOG_RECORD_KEYS = logging.LogRecord("name", 0, "pathname", 0, "msg", (), None).__dict__.keys()


def render_to_log_kwargs(logger: logging.Logger, name: str, event_dict: EventDict) -> EventDict:
    msg = event_dict.pop("event")
    msg = f"{msg!s} " + " ".join(
        f"{k}={event_dict.pop(k)!r}" for k in list(event_dict.keys()) if k not in _LOG_RECORD_KEYS
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
