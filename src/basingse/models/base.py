import uuid
from typing import Any

from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import func
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import declared_attr
from sqlalchemy.orm import Mapped

from .types import GUID

_Base = declarative_base()


class Base(_Base):
    __abstract__ = True

    @declared_attr
    def __tablename__(cls) -> str:  # noqa: B902
        return cls.__name__.lower() + "s"

    @declared_attr
    def __table_args__(cls) -> tuple[dict[str, Any]]:  # noqa: B902
        return ({"schema": "auth"},)


class Model(Base):

    __abstract__ = True

    id: Mapped[uuid.UUID] = Column(GUID(), primary_key=True, default=uuid.uuid4)
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} id={self.id}>"
