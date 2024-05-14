from collections.abc import Callable
from typing import Any
from typing import TypeVar

from sqlalchemy.orm import Session
from sqlalchemy.sql import select

from . import Model
from basingse import svcs

M = TypeVar("M", bound=Model)


def update_one(cls: type[M], data: dict[str, Any], field: str) -> M:
    """Update or create an instance of a class, querying by a primary field."""
    session = svcs.get(Session)
    instance = query_one(session, cls, field, data[field])
    if instance is None:
        instance = cls(**data)
        session.add(instance)
    else:
        for key, value in data.items():
            setattr(instance, key, value)
    return instance


def query_one(session: Session, cls: type[M], field: str, value: Any) -> M | None:
    """Query for a single instance of a class by a field."""
    return session.scalar(select(cls).filter(getattr(cls, field), value).limit(1))


def query_select_factory(cls: type[M]) -> Callable[[], list[M]]:
    """Create a query factory to select from a given class."""

    def query() -> list[M]:
        session = svcs.get(Session)
        return list(session.scalars(select(cls)))

    return query
