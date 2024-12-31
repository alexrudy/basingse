import dataclasses as dc
from collections.abc import Iterable
from typing import Any

import humanize
import structlog
from bootlace import as_tag
from bootlace import Bootlace
from bootlace import render
from flask import Flask
from flask_attachments import Attachments
from werkzeug.utils import find_modules
from werkzeug.utils import import_string

from . import attachments as attmod  # noqa: F401
from . import svcs
from .admin.settings import AdminSettings
from .assets import Assets
from .auth.extension import Authentication
from .customize.settings import CustomizeSettings
from .logging import Logging
from .markdown import MarkdownOptions
from .models import Model
from .models import SQLAlchemy
from .page.settings import PageSettings
from .utils.urls import rewrite_endpoint
from .utils.urls import rewrite_update
from .utils.urls import rewrite_url
from .views import CoreSettings


logger = structlog.get_logger()


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

    assets: Assets = dc.field(default_factory=Assets)
    auth: Authentication = Authentication()
    attachments: Attachments = Attachments(registry=Model.registry)
    customize: CustomizeSettings = CustomizeSettings()
    page: PageSettings = PageSettings()
    core: CoreSettings = CoreSettings()
    sqlalchemy: SQLAlchemy = SQLAlchemy()
    logging: Logging = Logging()
    markdown: MarkdownOptions = MarkdownOptions()
    context: Context | None = Context()
    bootlace: Bootlace | None = Bootlace()
    admin: AdminSettings | None = AdminSettings()

    initialized: dict[str, bool] = dc.field(default_factory=dict)

    def init_field(self, app: Flask, name: str) -> None:
        attr = getattr(self, name)
        if attr is None:
            return

        config = app.config.get_namespace("BASINGSE_")

        if dc.is_dataclass(attr):
            cfg = config.get(name, {})
            if any(cfg):
                attr = dc.replace(attr, **cfg)

        if hasattr(attr, "init_app"):
            if self.initialized.get(name, False):
                raise RuntimeError(f"{name} already initialized")

            attr.init_app(app)
            self.initialized[name] = True

    def init_app(self, app: Flask) -> None:
        svcs.init_app(app)
        for field in dc.fields(self):
            if not self.initialized.get(field.name, False):
                self.init_field(app, field.name)

    def auto_import(self, app: Flask, name: str, avoid: None | Iterable[str] = None) -> None:

        # Truncate .app if we are in a .app module (not package) so that users can pass __name__
        if name.endswith(".app") and __file__.endswith("app.py"):
            name = name[:-4]

        avoid = {"tests", "test", "testing", "wsgi", "app"} if avoid is None else set(avoid)

        for module in find_modules(name, include_packages=True, recursive=True):

            if set(module.split(".")).intersection(avoid):
                continue

            module = import_string(module)
            if hasattr(module, "init_app"):
                module.init_app(app)
