import dataclasses as dc
import inspect
from collections.abc import Callable
from collections.abc import Iterable
from collections.abc import Iterator
from typing import Any
from typing import ClassVar
from typing import Generic
from typing import TypedDict
from typing import TypeVar

import sqlalchemy as sa
import sqlalchemy.orm as orm
import wtforms
from marshmallow import fields
from marshmallow.utils import _Missing as Missing
from marshmallow.utils import missing
from sqlalchemy.types import TypeEngine


#: Type alias for the python type of a SQLAlchemy attribute.
T = TypeVar("T")

#: Type alias for an SQLAlchemy attribute defining a column or relationship.
_SqlAlchemyAttribute = sa.Column | orm.relationships.RelationshipProperty | sa.sql.elements.KeyedColumnElement


@dc.dataclass
class SchemaInfo(Generic[T]):

    load_default: T | Missing | None = missing
    dump_default: T | Missing | None = missing
    data_key: str | None = None
    validate: None | (Callable[[Any], Any] | Iterable[Callable[[Any], Any]]) = None
    required: bool = False
    dump_only: bool = False
    load_only: bool = False

    def field(self, name: str, attribute: _SqlAlchemyAttribute) -> fields.Field:
        if isinstance(attribute, (sa.Column, sa.sql.elements.KeyedColumnElement)):
            return self._column_field(attribute)
        elif isinstance(attribute, orm.relationships.RelationshipProperty):
            return self._relationship_field(attribute)
        else:
            raise ValueError(f"Unable to determine the type of {attribute!r}")

    def _relationship_field(self, relationship: orm.relationships.RelationshipProperty) -> fields.Field:
        if relationship.uselist:
            return fields.List(self._relationship_scalar_field(relationship))
        else:
            return self._relationship_scalar_field(relationship)

    def _relationship_scalar_field(self, relationship: orm.relationships.RelationshipProperty) -> fields.Field:
        target = relationship.target
        if (sch := getattr(target, "__schema__", None)) is not None:
            return fields.Nested(sch())
        else:
            raise ValueError(f"Unable to find schema for {target!r}")

    def _column_field(self, column: sa.Column | sa.sql.elements.KeyedColumnElement) -> fields.Field:

        fcls = self._get_field_for_type(column.type)

        assert issubclass(fcls, fields.Field), f"{fcls} is not a subclass of {fields.Field}"

        field = fcls(
            load_default=self.load_default,
            dump_default=self.dump_default,
            data_key=self.data_key,
            attribute=column.name,
            validate=self.validate,
            required=self.required,
            allow_none=column.nullable,
            dump_only=self.dump_only,
            load_only=self.load_only,
        )

        return field

    def _get_field_for_type(self, datatype: TypeEngine) -> type[fields.Field]:
        for bcls in inspect.getmro(type(datatype)):
            if (fcls := self.COLUMN_MAPPING.get(bcls)) is not None:
                return fcls

        raise ValueError(f"Unable to find an appropriate column type for {datatype!r}")

    COLUMN_MAPPING: ClassVar[dict[type[TypeEngine], type[fields.Field]]] = {
        sa.Integer: fields.Integer,
        sa.UUID: fields.UUID,
        sa.Uuid: fields.UUID,
        sa.Date: fields.Date,
        sa.DateTime: fields.DateTime,
        sa.Text: fields.String,
        sa.String: fields.String,
        sa.Boolean: fields.Boolean,
    }


@dc.dataclass
class FormInfo(Generic[T]):

    validators: list[Any] | None = None
    label: str | None = None
    description: str | None = None
    choices: Iterator[str] | None = None

    def field(self, name: str, column: _SqlAlchemyAttribute) -> wtforms.Field:
        fcls = self._get_field_for_type(column.type)

        kwargs = dc.asdict(self)
        for key in list(key for key in kwargs.keys() if kwargs[key] is None):
            del kwargs[key]

        if not column.nullable:
            if not any(
                isinstance(validator, wtforms.validators.DataRequired) for validator in kwargs.get("validators", [])
            ):
                kwargs.setdefault("validators", []).append(wtforms.validators.DataRequired())

        assert issubclass(fcls, wtforms.Field), f"{fcls} is not a subclass of {wtforms.Field}"

        field = fcls(
            **kwargs,
        )

        return field

    def _get_field_for_type(self, datatype: TypeEngine) -> type[wtforms.Field]:
        for bcls in inspect.getmro(type(datatype)):
            if (fcls := self.COLUMN_MAPPING.get(bcls)) is not None:
                return fcls

        raise ValueError(f"Unable to find an appropriate column type for {datatype!r}")

    COLUMN_MAPPING: ClassVar[dict[type[TypeEngine], type[wtforms.Field]]] = {
        sa.Integer: wtforms.IntegerField,
        sa.Date: wtforms.DateField,
        sa.DateTime: wtforms.DateTimeField,
        sa.Text: wtforms.TextAreaField,
        sa.String: wtforms.StringField,
        sa.Boolean: wtforms.BooleanField,
    }


class Info(TypedDict):
    form: FormInfo | wtforms.Field
    schema: SchemaInfo | fields.Field
