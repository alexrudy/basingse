import enum
import functools
from collections.abc import Callable
from typing import Any
from typing import TYPE_CHECKING
from typing import TypeVar

import wtforms
from bootlace.table import ColumnBase as Column
from bootlace.table import Table
from flask_wtf import FlaskForm
from marshmallow import post_load
from marshmallow import Schema as BaseSchema

from basingse.models.info import _SqlAlchemyAttribute
from basingse.models.info import FormInfo
from basingse.models.info import SchemaInfo

if TYPE_CHECKING:
    from . import Model

E = TypeVar("E", bound=enum.Enum)


class Schema(BaseSchema):

    @post_load
    def make_instance(self, data: dict[str, Any], **kwargs: Any) -> Any:
        return self.Meta.model(**data)  # type: ignore


A = TypeVar("A")
F = TypeVar("F")


def process_info(
    name: str,
    attribute: _SqlAlchemyAttribute,
    value: A | F,
    info_type: type[A],
    converter: Callable[[A, str, _SqlAlchemyAttribute], F],
) -> F:
    if isinstance(value, info_type):
        return converter(value, name, attribute)
    else:
        return value  # type: ignore


def collect_attributes(
    model: "type[Model]",
    key: str,
    info_type: type[A] | None,
    converter: Callable[[A, str, _SqlAlchemyAttribute], F] | None,
) -> dict[str, F]:
    attrs = {}
    for name, column in model.__table__.columns.items():
        if value := column.info.get(key):
            if info_type is None or converter is None:
                attrs[name] = value
            elif isinstance(value, info_type):
                attrs[name] = converter(value, name, column)
            else:
                attrs[name] = value

    for name, relationship in model.__mapper__.relationships.items():
        if value := relationship.info.get(key):
            if info_type is None or converter is None:
                attrs[name] = value
            elif isinstance(value, info_type):
                attrs[name] = converter(value, name, column)
            else:
                attrs[name] = value
    return attrs


@functools.cache
def build_model_schema(model: "type[Model]") -> type[Schema]:
    schema_fields = collect_attributes(model, "schema", SchemaInfo, SchemaInfo.field)

    meta = type("Meta", (), {"model": model})
    attrs = {"Meta": meta, **schema_fields}
    return type(model.__name__ + "Schema", (Schema,), attrs)


@functools.cache
def build_model_listview(model: "type[Model]") -> type[Table]:
    columns: dict[str, Column] = collect_attributes(model, "listview", type(None), None)
    return type(model.__name__ + "Table", (Table,), columns)


@functools.cache
def build_model_form(model: "type[Model]") -> type[wtforms.Form]:
    fields: dict[str, wtforms.Field] = collect_attributes(model, "form", FormInfo, FormInfo.field)

    if "submit" not in fields:
        fields["submit"] = wtforms.SubmitField("Submit")

    return type(model.__name__ + "Form", (FlaskForm,), fields)
