from __future__ import annotations

import dataclasses as dc
import datetime as dt
import functools
import sqlite3
import uuid
from collections.abc import Iterator
from typing import Any
from typing import ClassVar

import structlog
from flask import abort
from flask import flash
from flask import Flask
from flask.cli import AppGroup
from flask_alembic import Alembic
from sqlalchemy import create_engine
from sqlalchemy import DateTime
from sqlalchemy import event
from sqlalchemy import func
from sqlalchemy import MetaData
from sqlalchemy import text
from sqlalchemy import Uuid
from sqlalchemy.engine import Engine
from sqlalchemy.engine.interfaces import DBAPIConnection
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import declared_attr
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import Session as BaseSession
from sqlalchemy.pool import ConnectionPoolEntry

from basingse import svcs

alembic = Alembic()

CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


logger = structlog.get_logger()


def tablename(name: str) -> str:
    word = name[0].lower()
    for c in name[1:]:
        if c.isupper():
            word += "_"
        word += c.lower()
    return word + "s"


class Base(DeclarativeBase):
    __abstract__ = True

    __metadata__: ClassVar[MetaData] = MetaData(naming_convention=CONVENTION)

    @declared_attr.directive
    def __tablename__(cls) -> str:  # noqa: B902
        return tablename(cls.__name__)


class Model(Base):
    __abstract__ = True

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, default=uuid.uuid4)
    created: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated: Mapped[dt.datetime] = mapped_column(DateTime(timezone=True), onupdate=func.now(), default=func.now())

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} id={self.id}>"


class Session(BaseSession):
    """A session with a few extra query helper methods"""

    def get_or_404(self, model: type[Model], id: uuid.UUID) -> Model:
        """Get a model by ID or raise a 404"""
        obj = self.get(model, id)
        if obj is None:
            flash(f"{model.__name__} not found")
            abort(404)
        return obj


@event.listens_for(Engine, "connect")
def set_sqlite_foreignkey_pragma(dbapi_connection: DBAPIConnection, connection_record: ConnectionPoolEntry) -> None:
    if isinstance(dbapi_connection, sqlite3.Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


group = AppGroup("db", help="Database commands")


@group.command("init")
def init() -> None:
    """Initialize the database"""
    engine = svcs.get(Engine)
    Model.metadata.create_all(engine)


@dc.dataclass
class Database:
    @property
    def engine(self) -> Engine:
        return svcs.get(Engine)

    @property
    def session(self) -> Session:
        return svcs.get(Session)

    def apply_driver_hacks(self, app: Flask, uri: Any, options: dict[str, str]) -> tuple[Any, dict[str, str]]:
        return uri, options


@dc.dataclass(frozen=True)
class SQLAlchemy:

    db: Database = dc.field(default_factory=Database)

    @property
    def engine(self) -> Engine:
        return svcs.get(Engine)

    @property
    def session(self) -> Session:
        return svcs.get(Session)

    @property
    def metadata(self) -> MetaData:
        return Base.metadata

    def init_app(self, app: Flask) -> None:
        """Initialize just the services component"""

        engine = create_engine(app.config["SQLALCHEMY_DATABASE_URI"])

        def engine_health_check(engine: Engine) -> None:
            with engine.connect() as conn:
                conn.scalar(text("SELECT 1"))

        def session_factory(cls: type[Session]) -> Iterator[Session]:
            with cls(bind=svcs.get(Engine)) as session:
                yield session

        svcs.register_value(
            app,
            Engine,
            engine,
            enter=False,
            ping=engine_health_check,
            on_registry_close=engine.dispose,
        )

        svcs.register_factory(app, Session, functools.partial(session_factory, Session))

        svcs.register_factory(app, BaseSession, functools.partial(session_factory, Session))

        app.cli.add_command(group)

        # We fake our way through as if we were the default SQLAlchemy extension
        app.extensions["sqlalchemy"] = self
        alembic.init_app(app)
