import dataclasses as dc
from collections.abc import Iterable

import structlog
from flask import Flask
from werkzeug.utils import find_modules
from werkzeug.utils import import_string


logger = structlog.get_logger(__name__)

DEFAULT_AVOID = {"tests", "test", "testing", "wsgi", "app"}


@dc.dataclass()
class AutoImport:
    avoid: None | Iterable[str] = None
    name: str | None = None

    def init_app(self, app: Flask) -> None:
        name = self.name or app.import_name
        self.auto_import(app, name, self.avoid)

    def auto_import(self, app: Flask, name: str, avoid: None | Iterable[str] = None) -> "AutoImportRecord":
        # Truncate .app if we are in a .app module (not package) so that users can pass __name__
        if name.endswith(".app"):
            name = name[:-4]

        avoid = DEFAULT_AVOID if avoid is None else set(avoid)

        records = []

        for module_name in find_modules(name, include_packages=True, recursive=True):
            if set(module_name.split(".")).intersection(avoid):
                records.append(AutoImportModuleRecord(module_name, skipped=True, initialized=False))
                continue

            module = import_string(module_name)
            if hasattr(module, "init_app"):
                module.init_app(app)
                records.append(AutoImportModuleRecord(module_name, skipped=False, initialized=True))
            else:
                records.append(AutoImportModuleRecord(module_name, skipped=False, initialized=False))

        record = AutoImportRecord(name, avoid, records)
        app.extensions["autoimport"] = record
        return record


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

    def __len__(self) -> int:
        return len(self.modules)

    def __getitem__(self, name: str) -> AutoImportModuleRecord:
        for module in self.modules:
            if module.name == name:
                return module
        raise KeyError(f"Module {name} not found in {self.name}")
