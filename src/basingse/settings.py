import dataclasses as dc
import logging
from typing import Any

import humanize
import structlog
from bootlace import as_tag
from bootlace import Bootlace
from bootlace import render
from flask import Flask
from flask_attachments import Attachments
from rich.traceback import install

from . import attachments as attmod  # noqa: F401
from . import svcs
from .admin.settings import AdminSettings
from .assets import Assets
from .auth.extension import Authentication
from .customize.settings import CustomizeSettings
from .markdown import MarkdownOptions
from .models import Model
from .models import SQLAlchemy
from .page.settings import PageSettings
from .utils.urls import rewrite_endpoint
from .utils.urls import rewrite_update
from .utils.urls import rewrite_url
from .views import core
from .views import CoreSettings


logger = structlog.get_logger()


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

    # formatter = structlog.stdlib.ProcessorFormatter(
    #     processors=[structlog.dev.ConsoleRenderer()],
    # )

    install(show_locals=True)


@dc.dataclass(frozen=True)
class Logging:

    def init_app(self, app: Flask) -> None:
        configure_structlog()


@dc.dataclass(frozen=True)
class Context:

    def init_app(self, app: Flask) -> None:
        app.context_processor(context)


def context() -> dict[str, Any]:
    return {
        "humanize": humanize,
        "rewrite": rewrite_url,
        "endpoint": rewrite_endpoint,
        "update": rewrite_update,
        "as_tag": as_tag,
        "render": render,
    }


@dc.dataclass
class BaSingSe:

    admin: AdminSettings | None = AdminSettings()
    assets: Assets | None = dc.field(default_factory=lambda: Assets(blueprint=core))
    auth: Authentication | None = Authentication()
    attachments: Attachments | None = Attachments(registry=Model.registry)
    customize: CustomizeSettings | None = CustomizeSettings()
    page: PageSettings | None = PageSettings()
    core: CoreSettings | None = CoreSettings()
    sqlalchemy: SQLAlchemy | None = SQLAlchemy()
    logging: Logging | None = Logging()
    markdown: MarkdownOptions | None = MarkdownOptions()
    context: Context | None = Context()
    bootlace: Bootlace | None = Bootlace()

    initailized: dict[str, bool] = dc.field(default_factory=dict)

    def init_app(self, app: Flask) -> None:
        svcs.init_app(app)

        config = app.config.get_namespace("BASINGSE_")

        for field in dc.fields(self):
            attr = getattr(self, field.name)
            if attr is None:
                continue

            if dc.is_dataclass(attr):
                cfg = config.get(field.name, {})
                attr = dc.replace(attr, **cfg)

            if hasattr(attr, "init_app"):
                if self.initailized.get(field.name, False):
                    raise RuntimeError(f"{field.name} already initialized")

                attr.init_app(app)
                self.initailized[field.name] = True
