import os
from typing import Any

import structlog
from basingse.settings import BaSingSe
from flask import Flask
from sqlalchemy import event
from sqlalchemy.engine import Engine
from werkzeug.middleware.proxy_fix import ProxyFix

logger = structlog.get_logger()


def log_queries(
    conn: Any, cursor: Any, statement: str, parameters: dict[str, Any], context: Any, executemany: Any
) -> None:
    if statement.strip().startswith("PRAGMA ") or statement.strip().startswith("CREATE "):
        pass
        # logger.log(5, "%s parameters=%r", statement.strip(), parameters)
    else:
        logger.debug("%s parameters=%r", statement, parameters)


def configure_app(app: Flask, config: dict[str, Any] | None = None, prefix: str | None = None) -> None:
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    if prefix is None:
        prefix = "BASINGSE"

    # Load because they might impact where we get other config files
    app.config.from_prefixed_env(prefix=prefix)
    if config:
        app.config.update(config)

    # Load the real configurations
    app.config.from_object("basingse.config.defaults")

    if not app.config["ENV"] == "test":
        app.config.from_pyfile(os.path.join(app.instance_path, app.config["ENV"].lower(), "config.py"))
    else:
        app.config.from_object("basingse.config.testing")

    if not app.testing:
        app.wsgi_app = ProxyFix(app.wsgi_app)  # type: ignore[method-assign]


def create_app(config: dict[str, Any] | None = None, prefix: str | None = None) -> Flask:
    app = Flask(__name__, instance_relative_config=True, instance_path=os.path.join(os.getcwd(), "instance"))

    configure_app(app, config, prefix)

    if app.config["ENV"] == "dev":
        event.listen(Engine, "before_cursor_execute", log_queries)

    # Initialize the application
    BaSingSe().init_app(app)

    return app
