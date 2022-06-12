from typing import Any
from typing import Optional
from typing import Union
from uuid import UUID

from sqlalchemy.dialects import postgresql
from sqlalchemy.engine import Dialect
from sqlalchemy.types import CHAR
from sqlalchemy.types import TypeDecorator


class GUID(TypeDecorator):
    """Platform-independent GUID type.

    Uses PostgreSQL's UUID type, otherwise uses
    CHAR(32), storing as stringified hex values.

    """

    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect: Dialect) -> Any:
        if dialect.name == "postgresql":
            return dialect.type_descriptor(postgresql.UUID())
        else:
            return dialect.type_descriptor(CHAR(32))  # type: ignore

    def process_bind_param(self, value: Optional[UUID], dialect: Dialect) -> Optional[str]:
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return str(value)
        else:
            if not isinstance(value, UUID):
                return "%.32x" % UUID(value).int
            else:
                # hexstring
                return "%.32x" % value.int

    def process_result_value(self, value: Union[None, UUID, str], dialect: Dialect) -> Optional[UUID]:
        if value is None:
            return value
        else:
            if not isinstance(value, UUID):
                value = UUID(value)
            return value
