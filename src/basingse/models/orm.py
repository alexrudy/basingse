from collections.abc import Callable
from typing import Any
from typing import TypeVar

import wtforms
from bootlace.table import ColumnBase as Column
from marshmallow import fields

from basingse.models.info import Auto
from basingse.models.info import ColumnInfo
from basingse.models.info import Detached
from basingse.models.info import FormInfo
from basingse.models.info import OrmInfo
from basingse.models.info import SchemaInfo

__all__ = ["SchemaInfo", "FormInfo", "Auto", "auto", "info"]

F = TypeVar("F", bound=Callable)


def auto() -> Auto:
    return Auto()


def autoinfo() -> dict[str, Any]:
    return info(schema=auto(), form=auto(), listview=auto())


def info(
    *,
    schema: SchemaInfo | fields.Field | Auto | None = None,
    form: FormInfo | wtforms.Field | Auto | None = None,
    listview: Column | ColumnInfo | Auto | None = None,
) -> dict[str, Any]:
    if isinstance(schema, Auto):
        schema = SchemaInfo()
    if isinstance(form, Auto):
        form = FormInfo()
    if isinstance(listview, Auto):
        listview = ColumnInfo()
    return dict(schema=schema, form=form, listview=listview)


def annotate(
    *,
    schema: SchemaInfo | fields.Field | Auto | None = None,
    form: FormInfo | wtforms.Field | Auto | None = None,
    listview: Column | ColumnInfo | Auto | None = None,
) -> Callable[[F], F]:
    def decorator(func: F) -> F:
        func.__info__ = info(schema=schema, form=form, listview=listview)  # type: ignore[attr-defined]
        return func

    return decorator


def detached(
    *,
    schema: SchemaInfo | fields.Field | Auto | None = None,
    form: FormInfo | wtforms.Field | Auto | None = None,
    listview: Column | ColumnInfo | Auto | None = None,
) -> Detached:
    return Detached(OrmInfo(schema=schema, form=form, listview=listview))
