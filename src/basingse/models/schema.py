import enum
import functools
import warnings
from typing import Any
from typing import cast
from typing import TYPE_CHECKING
from typing import TypeVar

import wtforms
from bootlace.table import ColumnBase as Column
from bootlace.table import Table
from flask_wtf import FlaskForm
from marshmallow import fields
from marshmallow import post_load
from marshmallow import Schema as BaseSchema
from sqlalchemy.orm import Session

from basingse import svcs
from basingse.models import orm
from basingse.models.info import _Attribute
from basingse.models.info import Auto
from basingse.models.info import ColumnInfo
from basingse.models.info import FormInfo
from basingse.models.info import OrmInfo
from basingse.models.info import SchemaInfo

if TYPE_CHECKING:
    from . import Model

E = TypeVar("E", bound=enum.Enum)


class OrmInfoWarning(UserWarning):
    pass


class Schema(BaseSchema):

    def __init__(self, *, many: bool = False, instance: Any = None, **kwargs: Any) -> None:
        self._orm_instance = instance
        super().__init__(many=many, **kwargs)

    @post_load
    def make_instance(self, data: dict[str, Any], **kwargs: Any) -> Any:
        instance = self._orm_instance

        if "id" in data and not instance:
            session = svcs.get(Session)
            instance = session.get(self.Meta.model, data["id"])  # type: ignore

        if instance:
            for key, value in data.items():
                setattr(instance, key, value)
            return instance

        return self.Meta.model(**data)  # type: ignore


F = TypeVar("F")
A = TypeVar("A")


def process_info(
    name: str,
    column: _Attribute | None,
    value: A | F,
    info_type: type[A] | None,
) -> F:
    if info_type is None:
        return cast(F, value)
    elif isinstance(value, info_type):
        return cast(F, info_type.field(value, name, column))  # type: ignore
    else:
        return cast(F, value)


def collect_attributes(
    model: "type[Model]",
    key: str,
    info_type: type[A] | None,
) -> dict[str, F]:
    attrs: dict[str, F] = {}
    if hasattr(model, "__info__"):
        for name, info in model.__info__().items():
            if value := info.get(key):
                attrs[name] = process_info(name, None, value, info_type)  # type: ignore[arg-type]

    for name, column in model.__table__.columns.items():
        if isinstance(column.info, Auto):
            column.info = orm.info(schema=SchemaInfo(), form=FormInfo(), listview=ColumnInfo())  # type: ignore

        if not isinstance(column.info, (dict, OrmInfo)):
            warnings.warn(
                OrmInfoWarning(
                    f"Unexpected info for {model.__name__}.{name}: .info is {column.info!r} (type {type(column.info)})"
                ),
                stacklevel=2,
            )

            continue

        if value := column.info.get(key):
            attrs[name] = process_info(name, column, cast(A, value), info_type)

    for name, relationship in model.__mapper__.relationships.items():

        if isinstance(relationship.info, Auto):
            relationship.info = orm.info(schema=SchemaInfo(), form=FormInfo(), listview=ColumnInfo())

        if not isinstance(relationship.info, (dict, OrmInfo)):
            warnings.warn(
                OrmInfoWarning(
                    f"Unexpected info for {model.__name__}.{name}: .info is {relationship.info!r} (type {type(relationship.info)})"
                ),
                stacklevel=2,
            )

            continue

        if value := relationship.info.get(key):
            attrs[name] = process_info(name, relationship, value, info_type)

    reordered = {}
    for cls in reversed(model.__mro__):
        for name in cls.__dict__.keys():
            if name in attrs:
                reordered[name] = attrs.pop(name)

    reordered.update(attrs)
    return reordered


@functools.cache
def build_model_schema(model: "type[Model]") -> type[Schema]:
    schema_fields: dict[str, fields.Field] = collect_attributes(model, "schema", SchemaInfo)

    meta = type("Meta", (), {"model": model})
    attrs = {"Meta": meta, **schema_fields}
    return type(model.__name__ + "Schema", (Schema,), attrs)


@functools.cache
def build_model_listview(model: "type[Model]") -> type[Table]:
    columns: dict[str, Column] = collect_attributes(model, "listview", ColumnInfo)
    return type(model.__name__ + "Table", (Table,), columns)


@functools.cache
def build_model_form(model: "type[Model]") -> type[FlaskForm]:
    fields: dict[str, wtforms.Field] = collect_attributes(model, "form", FormInfo)

    if "submit" not in fields:
        fields["submit"] = wtforms.SubmitField("Save")

    for i, field in enumerate(fields.values()):
        field.creation_counter = i  # pyright: ignore

    form = type(model.__name__ + "Form", (FlaskForm,), fields)
    return form
