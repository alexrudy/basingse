import dataclasses as dc
from collections.abc import Iterable

import structlog
from flask import Flask
from werkzeug.utils import find_modules
from werkzeug.utils import import_string


logger = structlog.get_logger(__name__)


@dc.dataclass(frozen=True)
class AutoImport:

    avoid: None | Iterable[str] = None
    name: str | None = None

    def init_app(self, app: Flask) -> None:
        name = self.name or app.import_name
        self.auto_import(app, name, self.avoid)

    def auto_import(self, app: Flask, name: str, avoid: None | Iterable[str] = None) -> None:

        # Truncate .app if we are in a .app module (not package) so that users can pass __name__
        if name.endswith(".app") and __file__.endswith("app.py"):
            name = name[:-4]

        avoid = {"tests", "test", "testing", "wsgi", "app"} if avoid is None else set(avoid)

        records = []

        for module in find_modules(name, include_packages=True, recursive=True):

            if set(module.split(".")).intersection(avoid):
                records.append(AutoImportModuleRecord(module, skipped=True, initialized=False))
                continue

            module = import_string(module)
            if hasattr(module, "init_app"):
                module.init_app(app)
                records.append(AutoImportModuleRecord(module, skipped=False, initialized=True))
            else:
                records.append(AutoImportModuleRecord(module, skipped=False, initialized=False))

        record = AutoImportRecord(name, avoid, records)
        logger.debug("AutoImport finished", record=record)
        app.extensions["autoimport"] = record


@dc.dataclass(frozen=True)
class AutoImportModuleRecord:
    name: str
    skipped: bool
    initialized: bool

    def __repr__(self) -> str:
        if self.skipped:
            return f"<{self.name} skipped>"
        if self.initialized:
            return f"<{self.name} initialized>"
        return f"<{self.name} imported>"


@dc.dataclass(frozen=True)
class AutoImportRecord:
    name: str
    avoid: set[str]
    modules: list[AutoImportModuleRecord]
