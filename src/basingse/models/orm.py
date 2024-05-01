from collections.abc import Callable
from typing import Any
from typing import TypeVar

import sqlalchemy as sa
import sqlalchemy.orm as orm
import wtforms
from bootlace.table import ColumnBase as Column
from marshmallow import fields
from sqlalchemy.types import TypeEngine

from basingse.models.info import FormInfo
from basingse.models.info import SchemaInfo

T = TypeVar("T")


def column(
    datatype: TypeEngine,
    _arg: sa.sql.base.SchemaEventTarget | None = None,
    *_args: sa.sql.base.SchemaEventTarget,
    default: Any | Callable[[], Any] | None = None,
    nullable: bool = False,
    doc: str | None = None,
    index: bool | None = None,
    unique: bool | None = None,
    primary_key: bool = False,
    server_default: Any = None,
    onupdate: Any | Callable[[], Any] | None = None,
    schema: SchemaInfo | fields.Field | None = None,
    form: FormInfo | wtforms.Field | None = None,
    listview: Column | None = None,
) -> orm.MappedColumn:
    """A wrapper around the sqlalchemy.orm mapped column"""

    info = {
        "schema": schema,
        "form": form,
        "listview": listview,
    }

    return orm.mapped_column(
        datatype,
        _arg,
        *_args,
        nullable=nullable,
        default=default,
        index=index,
        unique=unique,
        primary_key=primary_key,
        server_default=server_default,
        onupdate=onupdate,
        doc=doc,
        info=info,
    )


def relationship(
    argument: Any = None,
    secondary: Any = None,
    *,
    uselist: bool = True,
    primaryjoin: Any = None,
    secondaryjoin: Any = None,
    collection_class: Any | None = None,
    back_populates: str | None = None,
    order_by: Any = False,
    backref: Any = None,
    cascade: str = "save-update, merge",
    viewonly: bool = False,
    lazy: orm.relationships._LazyLoadArgumentType = "select",
    doc: str | None = None,
    foreign_keys: Any = None,
    remote_side: Any = None,
    single_parent: bool = False,
    innerjoin: bool = False,
    schema: SchemaInfo | fields.Field | None = None,
    form: FormInfo | wtforms.Field | None = None,
    listview: Column | None = None,
) -> orm.relationships._RelationshipDeclared[T]:
    info = {
        "schema": schema,
        "form": form,
        "listview": listview,
    }

    return orm.relationship(
        argument,
        secondary=secondary,
        uselist=uselist,
        primaryjoin=primaryjoin,
        secondaryjoin=secondaryjoin,
        collection_class=collection_class,
        back_populates=back_populates,
        order_by=order_by,
        backref=backref,
        cascade=cascade,
        viewonly=viewonly,
        lazy=lazy,
        doc=doc,
        foreign_keys=foreign_keys,
        remote_side=remote_side,
        single_parent=single_parent,
        innerjoin=innerjoin,
        info=info,
    )
