import dataclasses as dc
from typing import Any
from typing import cast

import pytest
from flask import Flask

from basingse.autoimport import AutoImport
from basingse.autoimport import AutoImportModuleRecord
from basingse.autoimport import DEFAULT_AVOID


@dc.dataclass
class FakeFlask:
    import_name: str = "a_real_module.app"
    extensions: dict[str, Any] = dc.field(default_factory=dict)


@dc.dataclass
class FakeModule:

    initialized: bool = False


class FakeModuleWithInit(FakeModule):

    def init_app(self, app: Any) -> None:
        self.initialized = True


@dc.dataclass
class FakeSetup:

    modules: dict[str, FakeModule] = dc.field(default_factory=dict)
    _calls: list[dict[str, Any]] = dc.field(default_factory=list)

    def find_modules(self, name: str, include_packages: bool = False, recursive: bool = False) -> list[str]:
        assert not name.endswith(".app")
        self._calls.append({"name": name, "include_packages": include_packages, "recursive": recursive})
        return list(self.modules.keys())

    def import_string(self, name: str) -> FakeModule:
        try:
            return self.modules[name]
        except KeyError:
            raise ImportError(f"Module {name} not found") from None

    def __getitem__(self, name: str) -> FakeModule:
        return self.modules[name]


def test_no_modules(monkeypatch: pytest.MonkeyPatch) -> None:

    setup = FakeSetup()
    monkeypatch.setattr("basingse.autoimport.find_modules", setup.find_modules)
    monkeypatch.setattr("basingse.autoimport.import_string", setup.import_string)

    app = cast(Flask, FakeFlask())
    ai = AutoImport()
    ai.auto_import(app, "not_a_real_module")

    record = app.extensions["autoimport"]

    assert record.modules == []
    assert record.avoid == DEFAULT_AVOID


def test_imports(monkeypatch: pytest.MonkeyPatch) -> None:

    setup = FakeSetup()
    setup.modules["simple"] = FakeModule()
    setup.modules["with_init"] = FakeModuleWithInit()
    monkeypatch.setattr("basingse.autoimport.find_modules", setup.find_modules)
    monkeypatch.setattr("basingse.autoimport.import_string", setup.import_string)

    app = cast(Flask, FakeFlask())
    ai = AutoImport()
    ai.auto_import(app, "not_a_real_module.app")

    record = app.extensions["autoimport"]
    with pytest.raises(KeyError):
        record["not_a_real_module"]

    assert not setup["simple"].initialized
    assert setup["with_init"].initialized
    assert len(record) == 2
    assert record.avoid == DEFAULT_AVOID


def test_imports_via_init_app(monkeypatch: pytest.MonkeyPatch) -> None:

    setup = FakeSetup()
    setup.modules["simple"] = FakeModule()
    setup.modules["with_init"] = FakeModuleWithInit()
    monkeypatch.setattr("basingse.autoimport.find_modules", setup.find_modules)
    monkeypatch.setattr("basingse.autoimport.import_string", setup.import_string)

    app = cast(Flask, FakeFlask("a_real_module.app"))
    ai = AutoImport()
    ai.init_app(app)

    assert setup._calls[0]["name"] == "a_real_module"

    record = app.extensions["autoimport"]
    with pytest.raises(KeyError):
        record["not_a_real_module"]

    assert not setup["simple"].initialized
    assert setup["with_init"].initialized
    assert len(record) == 2
    assert record.avoid == DEFAULT_AVOID


def test_imports_avoid(monkeypatch: pytest.MonkeyPatch) -> None:
    MODULE = "a.real.module"
    module = FakeModule()

    setup = FakeSetup()
    setup.modules[MODULE] = module
    monkeypatch.setattr("basingse.autoimport.find_modules", setup.find_modules)
    monkeypatch.setattr("basingse.autoimport.import_string", setup.import_string)

    app = cast(Flask, FakeFlask())
    ai = AutoImport()
    ai.auto_import(app, "starting.point", avoid=["real"])

    record = app.extensions["autoimport"]

    assert not module.initialized

    assert len(record) == 1
    assert record[MODULE].skipped, "Module should have been skipped"
    assert record.avoid == {"real"}


@pytest.mark.parametrize(
    "record, expected",
    [
        (AutoImportModuleRecord(name="foo", skipped=False, initialized=False), "<foo imported>"),
        (AutoImportModuleRecord(name="foo", skipped=True, initialized=False), "<foo skipped>"),
        (AutoImportModuleRecord(name="foo", skipped=False, initialized=True), "<foo initialized>"),
        (AutoImportModuleRecord(name="foo", skipped=True, initialized=True), "<foo skipped>"),
    ],
)
def test_module_record_repr(record: AutoImportModuleRecord, expected: str) -> None:
    assert repr(record) == expected
