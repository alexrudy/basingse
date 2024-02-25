from __future__ import annotations

import datetime as dt
import sqlite3
import uuid
from typing import ClassVar

from sqlalchemy import DateTime
from sqlalchemy import event
from sqlalchemy import func
from sqlalchemy import MetaData
from sqlalchemy import Uuid
from sqlalchemy.engine import Engine
from sqlalchemy.engine.interfaces import DBAPIConnection
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import declared_attr
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.pool import ConnectionPoolEntry

CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


class Model(DeclarativeBase):
    __abstract__ = True

    __metadata__: ClassVar[MetaData] = MetaData(naming_convention=CONVENTION)

    @declared_attr.directive
    def __tablename__(cls) -> str:  # noqa: B902
        return cls.__name__.lower() + "s"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, default=uuid.uuid4)
    created: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), default=func.now())

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} id={self.id}>"


@event.listens_for(Engine, "connect")
def set_sqlite_foreignkey_pragma(dbapi_connection: DBAPIConnection, connection_record: ConnectionPoolEntry) -> None:
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
