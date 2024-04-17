import logging
from collections.abc import Iterator
from pathlib import Path
from typing import Any
from typing import cast

import pytest
import structlog
from flask import Flask
from jinja2 import FileSystemLoader
from sqlalchemy import event
from sqlalchemy.engine import Engine
from structlog.types import EventDict

from basingse import svcs
from basingse.app import configure_app
from basingse.app import log_queries
from basingse.assets import AssetCollection
from basingse.auth.testing import LoginClient
from basingse.models import Model
from basingse.settings import BaSingSe


logger = structlog.get_logger()


@pytest.fixture(autouse=True, scope="session")
def setup_svcs_logging() -> None:
    svcs_logger = logging.getLogger("svcs")
    svcs_logger.addHandler(logging.NullHandler())
    svcs_logger.propagate = False


@pytest.fixture(autouse=True, scope="session")
def setup_query_logging() -> None:
    event.listen(Engine, "before_cursor_execute", log_queries)

    @event.listens_for(Engine, "commit")
    def receive_commit(conn: Any) -> None:
        logger.info("COMMIT")


@pytest.fixture
def app() -> Iterator[Flask]:
    import glob
    from werkzeug.utils import cached_property
    from jinja2.loaders import BaseLoader

    class TestingFlask(Flask):
        @cached_property
        def jinja_loader(self) -> BaseLoader | None:
            """Override the jinja loader to look through all test folders"""
            assert self.template_folder is not None, "Template folder must be set"
            return FileSystemLoader(
                [str(self.template_folder)] + glob.glob(self.root_path + "/**/templates", recursive=True)
            )

    app = TestingFlask(__name__)
    app.test_client_class = LoginClient
    configure_app(app, config={"ENV": "test", "ASSETS_FOLDER": None})
    bss = BaSingSe(logging=None)
    bss.init_app(app)
    assert bss.assets, "Assets should be initialized"
    bss.assets.collection.append(AssetCollection("tests", Path("manifest.json"), Path("assets")))

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
