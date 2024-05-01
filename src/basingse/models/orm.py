from typing import Any

import wtforms
from bootlace.table import ColumnBase as Column
from marshmallow import fields

from basingse.models.info import FormInfo
from basingse.models.info import SchemaInfo

__all__ = ["SchemaInfo", "FormInfo", "Auto", "auto", "info"]


class Auto:
    pass


def auto() -> Auto:
    return Auto()


def info(
    schema: SchemaInfo | fields.Field | Auto | None = None,
    form: FormInfo | wtforms.Field | Auto | None = None,
    listview: Column | None = None,
) -> dict[str, Any]:

    if isinstance(schema, Auto):
        schema = SchemaInfo()
    if isinstance(form, Auto):
        form = FormInfo()

    return dict(schema=schema, form=form, listview=listview)
