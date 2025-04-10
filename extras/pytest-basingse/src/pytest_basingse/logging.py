import logging
from typing import Any

import pytest
import structlog
from flask import Flask
from flask import request
from flask import request_finished
from flask import request_started
from sqlalchemy import Engine
from sqlalchemy import event
from sqlalchemy.engine.interfaces import DBAPIConnection
from sqlalchemy.pool import ConnectionPoolEntry
from structlog.types import EventDict

from .app import init_app
from basingse.logging import log_queries

__all__ = [
    "pytest_addoption",
    "setup_svcs_logging",
    "setup_query_logging",
    "setup_app_logging",
    "configure_structlog",
]

logger = structlog.get_logger()


def pytest_addoption(parser: pytest.Parser) -> None:
    parser.addoption("--log-queries", action="store_true", help="Log all queries")
    parser.addoption("--log-svcs", action="store_true", help="Enable logging for svcs")
    parser.addoption("--show-routes", action="store_true", help="Show routes")


@pytest.fixture(autouse=True, scope="session")
def setup_svcs_logging(request: pytest.FixtureRequest) -> None:
    svcs_logger = logging.getLogger("svcs")
    if request.config.getoption("--log-svcs"):
        svcs_logger.setLevel(logging.DEBUG)
        svcs_logger.addHandler(logging.StreamHandler())
    else:
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


@init_app.connect
def setup_app_logging(app: Flask) -> None:
    @request_started.connect_via(app)
    def log_request_started(sender: Any, **kwargs: Any) -> None:
        sender.logger.debug(request.method, path=request.path)

    @request_finished.connect_via(app)
    def log_request_finished(sender: Any, response: Any, **kwargs: Any) -> None:
        sender.logger.debug(response.status_code, path=request.path)


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
