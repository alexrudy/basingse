import enum
import functools
import warnings
from collections.abc import Sequence
from collections.abc import Set
from itertools import chain
from typing import TYPE_CHECKING
from typing import Any
from typing import TypeVar
from typing import cast

import wtforms
from bootlace.table import ColumnBase as Column
from bootlace.table import Table
from flask_wtf import FlaskForm
from marshmallow import Schema as BaseSchema
from marshmallow import fields
from marshmallow import post_dump
from marshmallow import post_load
from marshmallow import pre_load
from marshmallow.schema import SchemaOpts
from sqlalchemy.inspection import inspect
from sqlalchemy.orm import Session
from sqlalchemy.util.typing import TypedDict

from basingse import svcs
from basingse.models import orm
from basingse.models.info import Auto
from basingse.models.info import ColumnInfo
from basingse.models.info import FormInfo
from basingse.models.info import OrmInfo
from basingse.models.info import SchemaInfo
from basingse.models.info import _Attribute

if TYPE_CHECKING:
    from . import Model

E = TypeVar("E", bound=enum.Enum)
Keys = Sequence[str] | Set[str]


class OrmInfoWarning(UserWarning):
    pass


class Envelope(TypedDict):
    name: str | None
    plural: str | None


class EnvelopeOptions(SchemaOpts):
    envelope: str | None = None
    plural_envelope: str | None = None


class EnvelopeSchema(BaseSchema):
    OPTIONS_CLASS = EnvelopeOptions

    def __init__(
        self,
        *,
        only: Keys | None = None,
        exclude: Keys = (),
        many: bool | None = None,
        load_only: tuple[str, ...] = (),
        dump_only: tuple[str, ...] = (),
        partial: list[str] | None = None,
        unknown: str | None = None,
        context: dict[str, Any] | None = None,
        envelope: Envelope | None = None,
    ) -> None:
        super().__init__(
            only=only,
            exclude=exclude,
            many=many,
            load_only=load_only,
            dump_only=dump_only,
            partial=partial,
            unknown=unknown,
            context=context,
        )
        self.envelope = envelope

    def _get_envelope_key(self, many: bool) -> str | None:
        if many:
            if self.envelope and self.envelope["plural"]:
                return self.envelope["plural"]
            if self.opts.plural_envelope:
                return self.opts.plural_envelope
        else:
            if self.envelope and self.envelope["name"]:
                return self.envelope["name"]
            if self.opts.envelope:
                return self.opts.envelope

    @pre_load(pass_many=True)
    def unwrap_envelope(self, data: dict[str, Any], many: bool, **kwargs: Any) -> dict[str, Any]:
        key = self._get_envelope_key(many)
        if key and key in data:
            return data[key]
        return data

    @post_dump(pass_many=True)
    def wrap_envelope(self, data: dict[str, Any], many: bool, **kwargs: Any) -> dict[str, Any]:
        key = self._get_envelope_key(many)
        if key:
            return {key: data}
        return data


class Schema(EnvelopeSchema):
    def __init__(
        self,
        *,
        instance: Any | None = None,
        only: Keys | None = None,
        exclude: Keys = (),
        many: bool | None = None,
        load_only: tuple[str, ...] = (),
        dump_only: tuple[str, ...] = (),
        partial: list[str] | None = None,
        unknown: str | None = None,
        context: dict[str, Any] | None = None,
        envelope: Envelope | None = None,
    ) -> None:
        self._orm_instance = instance
        super().__init__(
            only=only,
            exclude=exclude,
            many=many,
            load_only=load_only,
            dump_only=dump_only,
            partial=partial,
            unknown=unknown,
            envelope=envelope,
            context=context,
        )

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

    for mapped_property in chain(inspect(model).iterate_properties, inspect(model).columns.values()):
        name = mapped_property.key

        if isinstance(mapped_property.info, Auto):
            mapped_property.info = orm.info(schema=SchemaInfo(), form=FormInfo(), listview=ColumnInfo())

        if not isinstance(mapped_property.info, (dict, OrmInfo)):
            warnings.warn(
                OrmInfoWarning(
                    f"Unexpected info for {model.__name__}.{name}: "
                    f".info is {mapped_property.info!r} (type {type(mapped_property.info)})"
                ),
                stacklevel=2,
            )

            continue

        if value := mapped_property.info.get(key):
            attrs[name] = process_info(name, mapped_property, cast(A, value), info_type)

    for name in list(vars(model)):
        if name in attrs:
            continue

        try:
            other_property = getattr(model, name)
        except AttributeError:
            continue

        try:
            info = other_property.info
        except AttributeError:
            continue

        if isinstance(info, Auto):
            other_property.info = info = orm.info(schema=SchemaInfo(), form=FormInfo(), listview=ColumnInfo())

        if not isinstance(info, (dict, OrmInfo)):
            warnings.warn(
                OrmInfoWarning(f"Unexpected info for {model.__name__}.{name}: .info is {info!r} (type {type(info)})"),
                stacklevel=2,
            )

            continue

        if value := info.get(key):
            attrs[name] = process_info(name, other_property, cast(A, value), info_type)

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
