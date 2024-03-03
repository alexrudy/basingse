import dataclasses as dc
import logging
from typing import Any

import humanize
import structlog
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
from .views import CoreSettings


@dc.dataclass(frozen=True)
class Logging:

    def init_app(self, app: Flask) -> None:
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
        app.context_processor(context)


logger = structlog.get_logger()


def context() -> dict[str, Any]:
    return {"humanize": humanize, "rewrite": rewrite_url, "endpoint": rewrite_endpoint, "update": rewrite_update}


@dc.dataclass
class BaSingSe:

    admin: AdminSettings | None = AdminSettings()
    assets: Assets | None = Assets()
    auth: Authentication | None = Authentication()
    attachments: Attachments | None = Attachments(registry=Model.registry)
    customize: CustomizeSettings | None = CustomizeSettings()
    page: PageSettings | None = PageSettings()
    core: CoreSettings | None = CoreSettings()
    sqlalchemy: SQLAlchemy | None = SQLAlchemy()
    logging: Logging | None = Logging()
    markdown: MarkdownOptions | None = MarkdownOptions()

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
                attr.init_app(app)
