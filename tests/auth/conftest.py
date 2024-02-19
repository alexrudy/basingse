import functools
import itertools
import logging
from collections.abc import Iterator
from typing import Any
from typing import cast
from urllib.parse import urlsplit as url_parse

import pytest
import svcs
from basingse.auth.extension import Authentication
from basingse.auth.models import User
from basingse.auth.testing import LoginClient
from basingse.auth.testing import Ok
from basingse.auth.testing import Redirect
from basingse.auth.testing import Response
from basingse.auth.testing import Unauthorized
from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy import event
from sqlalchemy import select
from sqlalchemy import text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import registry as Registry
from sqlalchemy.orm import Session
from structlog.types import EventDict
from werkzeug import Response as WerkzeugResponse

#: Global registry for SQLAlchemy models.
global_registry = Registry()


@pytest.fixture(autouse=True, scope="session")
def setup_svcs_logging() -> None:
    svcs_logger = logging.getLogger("svcs")
    svcs_logger.addHandler(logging.NullHandler())
    svcs_logger.propagate = False


@pytest.fixture
def registry(app: Flask) -> Iterator[Registry]:
    yield global_registry


@pytest.fixture(autouse=True, scope="session")
def log_engine_queries() -> None:
    logger = logging.getLogger(__name__)

    def log_queries(
        conn: Any, cursor: Any, statement: str, parameters: dict[str, Any], context: Any, executemany: Any
    ) -> None:
        logger.debug("%s parameters=%r", statement, parameters)

    event.listen(Engine, "before_cursor_execute", log_queries)


@pytest.fixture()
def engine(app: Flask, extension: Authentication, registry: Registry) -> Engine:
    engine = create_engine(app.config["SQLALCHEMY_DATABASE_URI"])
    registry.metadata.create_all(engine)

    svcs.flask.register_factory(
        app,
        Session,
        lambda: Session(bind=engine),
        ping=lambda session: session.execute(text("SELECT 1")).scalar_one(),
        # on_registry_close=engine.dispose,
    )

    return engine


@pytest.fixture
def session(engine: Engine, extension: Authentication, registry: Registry) -> Iterator[Session]:
    with Session(engine) as session:
        yield session


@pytest.fixture
def extension(app: Flask, registry: Registry) -> Iterator[Authentication]:
    attachments = Authentication(app=app, registry=registry)
    yield attachments


@pytest.fixture
def app() -> Iterator[Flask]:
    app = Flask(__name__)
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

    svcs.flask.init_app(app)

    @app.route("/")
    def home() -> str:
        return "Hello, world!"

    yield app


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
    engine: Engine,
    counter: Iterator[int],
) -> User:
    from basingse.auth.models import User
    from basingse.auth.permissions import Role
    from sqlalchemy.orm import Session

    with app.app_context(), Session(engine, expire_on_commit=False) as session:
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
def user(engine: Engine, app: Flask, request: Any) -> Iterator[functools.partial[User]]:
    counter = itertools.count()
    yield functools.partial(create_user, app=app, request=request, engine=engine, counter=counter)


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
        return ["expected Ok:", f"  Status: {left.status_code} == {right.status}", f"  Location: {left.location}"]

    return None
