import datetime as dt
import enum

import marshmallow.fields
import pytz
import structlog
import wtforms
from sqlalchemy import case
from sqlalchemy import DateTime
from sqlalchemy import event
from sqlalchemy import func
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import ORMExecuteState
from sqlalchemy.orm import Session
from sqlalchemy.orm import with_loader_criteria
from sqlalchemy.sql.expression import ColumnElement

from basingse.models import orm

log = structlog.get_logger(__name__)


class Status(enum.Enum):
    DRAFT = enum.auto()
    SCHEDULED = enum.auto()
    PUBLISHED = enum.auto()


class PublishMixin:
    _published_at: Mapped[dt.datetime] = mapped_column("published_at", DateTime(), nullable=True)

    def __init_subclass__(cls) -> None:
        super().__init_subclass__()

        @event.listens_for(Session, "do_orm_execute")
        def _filter_published(execute_state: ORMExecuteState) -> None:
            if (
                not execute_state.is_column_load
                and not execute_state.is_relationship_load
                and not execute_state.execution_options.get("include_unpublished", False)
            ):
                execute_state.statement = execute_state.statement.options(
                    with_loader_criteria(cls, lambda cls: cls.is_published, include_aliases=True)
                )
            else:
                log.debug("Query without published filter")

    @hybrid_property
    @orm.annotate(schema=marshmallow.fields.DateTime(), form=wtforms.DateTimeField())
    def published_at(self) -> dt.datetime | None:
        return pytz.utc.localize(self._published_at) if self._published_at is not None else None

    @published_at.expression  # type: ignore[no-redef]
    def published_at(cls) -> ColumnElement:  # noqa: B902
        return cls._published_at

    @published_at.setter  # type: ignore[no-redef]
    def published_at(self, when: dt.datetime | None) -> None:
        if when is None:
            self._published_at = None
            return
        if isinstance(when, dt.datetime):
            if when.tzinfo is None:
                when = pytz.utc.localize(when)
            else:
                when = when.astimezone(pytz.utc)
            self._published_at = when.replace(tzinfo=None)
        elif isinstance(when, ColumnElement):
            self._published_at = when

    @hybrid_property
    def status(self) -> Status:
        if self.published_at is None:
            return Status.DRAFT

        now = dt.datetime.now(pytz.UTC)
        if self.published_at > now:
            return Status.SCHEDULED
        return Status.PUBLISHED

    @status.expression  # type: ignore[no-redef]
    def status(cls) -> ColumnElement:  # noqa: B902
        return case(
            (cls.published_at == None, Status.DRAFT.name),
            (cls.published_at > func.now(), Status.SCHEDULED.name),
            else_=Status.PUBLISHED.name,
        )

    @hybrid_property
    @orm.annotate(form=wtforms.BooleanField("Publish"))
    def is_published(self) -> bool:
        # TODO: Support showing draft posts when logged in
        return self.status == Status.PUBLISHED

    @is_published.setter  # type: ignore[no-redef]
    def is_published(self, value: bool) -> None:
        if value and not self.is_published:
            self.publish()
        elif not value:
            self.unpublish()

    @is_published.expression  # type: ignore[no-redef]
    def is_published(cls) -> ColumnElement:  # noqa: B902
        return cls.published_at <= func.now()

    def publish(self) -> None:
        self.published_at = func.now()  # type: ignore[method-assign]
        # self.published_at = dt.datetime.now(pytz.UTC)  # type: ignore

    def unpublish(self) -> None:
        self.published_at = None  # type: ignore

    def schedule(self, when: dt.datetime) -> None:
        self.published_at = when  # type: ignore
