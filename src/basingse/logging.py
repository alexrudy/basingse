import dataclasses as dc
import logging
from collections.abc import MutableMapping
from typing import Any
from typing import TypeVar

import structlog
from flask import current_app
from flask import Flask
from flask import has_app_context
from flask import request
from flask import request_started
from flask_login import user_loaded_from_cookie
from flask_login import user_loaded_from_request
from rich.traceback import install
from sqlalchemy import Engine
from sqlalchemy import event
from sqlalchemy.engine.interfaces import DBAPIConnection
from sqlalchemy.pool import ConnectionPoolEntry

logger = structlog.get_logger()


D = TypeVar("D", bound=MutableMapping[str, Any])


class DebugDemoter:
    def __call__(self, logger: Any, method_name: str, event_dict: D) -> D:
        if not event_dict.pop("debug", False):
            return event_dict

        if not has_app_context():
            return event_dict

        if current_app.debug:
            return event_dict

        if isinstance(event_dict["level"], str):
            event_dict["level"] = logging.getLevelNamesMapping()[event_dict["level"].upper()]

        if event_dict["level"] > logging.DEBUG:
            event_dict["level"] = logging.DEBUG

        return event_dict


@dc.dataclass
class RequestInfo:
    id: str | None
    peer: str | None
    path: str | None
    host: str | None
    method: str

    def __repr__(self) -> str:
        if self.id:
            return f"<{self.method} {self.path} from {self.peer} ({self.host}) [id={self.id}]>"
        else:
            return f"<{self.method} {self.path} from {self.peer} ({self.host})>"

    @classmethod
    def build(cls) -> "RequestInfo":
        return cls(
            id=request.headers.get("X-Unique-ID", None),
            peer=request.headers.get("X-Forwarded-For", request.remote_addr),
            path=request.path,
            host=request.host,
            method=request.method,
        )


def bind_request_details(sender: Flask, **extras: dict[str, Any]) -> None:
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(
        request=RequestInfo.build(),
    )


def bind_user_details(sender: Flask, user: Any, **extras: dict[str, Any]) -> None:
    structlog.contextvars.bind_contextvars(user=user.id)


def configure_structlog() -> None:
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(),
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.NOTSET),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=False,
    )

    install(show_locals=True)


def setup_query_logging() -> None:
    event.listen(Engine, "before_cursor_execute", log_queries)

    @event.listens_for(Engine, "commit")
    def receive_commit(conn: Any) -> None:
        logger.debug("COMMIT", engine=conn.engine.url)

    @event.listens_for(Engine, "connect")
    def connect(dbapi_connection: DBAPIConnection, connection_record: ConnectionPoolEntry) -> None:
        logger.debug("connecting")


@dc.dataclass(frozen=True)
class Logging:
    def init_app(self, app: Flask) -> None:
        configure_structlog()
        request_started.connect(bind_request_details, app)
        user_loaded_from_request.connect(bind_user_details, app)
        user_loaded_from_cookie.connect(bind_user_details, app)
        if app.config.get("LOG_QUERIES", False):
            setup_query_logging()

        if not app.config.get("DEBUG", False) and not app.config.get("LOG_WERKZEUG", True):
            wkz = logging.getLogger("werkzeug")
            wkz.addHandler(logging.NullHandler())


def log_queries(
    conn: Any,
    cursor: Any,
    statement: str,
    parameters: dict[str, Any],
    context: Any,
    executemany: Any,
) -> None:
    if statement.strip().startswith("PRAGMA ") or statement.strip().startswith("CREATE "):
        logger.debug("%s parameters=%r", statement.strip(), parameters)
    else:
        logger.debug("%s parameters=%r", statement, parameters)
