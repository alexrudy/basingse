import dataclasses as dc
import functools
from collections.abc import Callable
from collections.abc import Iterator
from collections.abc import Mapping
from typing import Any
from typing import Protocol
from typing import TypeVar

import humanize
import structlog
from bootlace import as_tag
from bootlace import Bootlace
from bootlace import render
from flask import Flask

from . import svcs
from .admin.settings import AdminSettings
from .assets import Assets
from .attachments import Attachments
from .auth.extension import Authentication
from .autoimport import AutoImport
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


logger = structlog.get_logger(__name__)

NAMESPACE = "BASINGSE"


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


class Settings(Protocol):

    def init_app(self, app: Flask) -> None: ...


class BaSingSe(Mapping[str, Settings]):

    EXTENSIONS: dict[str, Callable[[], Settings]] = {
        "autoimport": AutoImport,
        "assets": Assets,
        "auth": Authentication,
        "attachments": functools.partial(Attachments, registry=Model.registry),
        "customize": CustomizeSettings,
        "page": PageSettings,
        "core": CoreSettings,
        "sqlalchemy": SQLAlchemy,
        "logging": Logging,
        "markdown": MarkdownOptions,
        "context": Context,
        "bootlace": Bootlace,
        "admin": AdminSettings,
    }

    def __init__(self, all: bool = False) -> None:
        self._extensions: dict[str, Settings] = {}
        self._initialized: set[str] = set()
        if all:
            self.enable_all()

    def __getitem__(self, key: object) -> Settings:
        if not isinstance(key, str):
            raise TypeError(f"Key must be a string, not {type(key).__name__}")
        try:
            return self._extensions[key]
        except KeyError:
            if key in self.EXTENSIONS:
                self._extensions[key] = settings = self.EXTENSIONS[key]()
                return settings
            raise

    def __iter__(self) -> Iterator[str]:
        return iter(self.EXTENSIONS)

    def __len__(self) -> int:
        return len(self.EXTENSIONS)

    def __contains__(self, key: object) -> bool:
        return key in self.EXTENSIONS

    def __getattr__(self, name: str) -> Settings:
        try:
            return self._extensions[name]
        except KeyError:
            raise AttributeError(name) from None

    def __setitem__(self, name: str, value: Settings) -> None:
        self._extensions[name] = value

    def __delitem__(self, key: object) -> None:
        if not isinstance(key, str):
            raise TypeError(f"Key must be a string, not {type(key).__name__}")
        del self._extensions[key]

    def enable(self, *extensions: str) -> "BaSingSe":
        for extension in extensions:
            self._extensions[extension] = self.EXTENSIONS[extension]()
        return self

    def enable_all(self) -> "BaSingSe":
        for extension in self.EXTENSIONS:
            self.enable(extension)
        return self

    def disable(self, *extensions: str) -> "BaSingSe":
        for extension in extensions:
            del self._extensions[extension]
        return self

    def init_app(self, app: Flask) -> None:

        config = app.config.get_namespace(f"{NAMESPACE}_")

        svcs.init_app(app)
        for ext in self._extensions.keys():
            if ext in self._initialized:
                continue
            extension = apply_config(config, ext, self._extensions[ext])
            extension.init_app(app)
            self._initialized.add(ext)

        svcs.register_value(app, type(self), self)


E = TypeVar("E", bound=Settings)


def apply_config(config: dict[str, Any], name: str, extension: E) -> E:
    extension_config = config.get(name, {})
    if dc.is_dataclass(extension):

        for field in dc.fields(extension):
            key = f"{name}_{field.name}"
            if key in config:
                extension_config[field.name] = config[key]

        extension = dc.replace(extension, **extension_config)

    return extension
