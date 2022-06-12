import enum
import secrets
import uuid
from typing import Any

from basingse.models.types import GUID
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy.orm import relationship

from .base import Base
from .base import Model


class User(Model):

    username = Column(String, nullable=False, unique=True, doc="Username")
    active: bool = Column(Boolean, nullable=False, default=False, doc="Is this user active?")

    token = Column(String(64), nullable=False, default=secrets.token_hex(16))

    @property
    def is_active(self) -> bool:
        return self.active

    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def is_anonymous(self) -> bool:
        return False


class ContactKind(enum.Enum):

    EMAIL = enum.auto()


class Contact(Base):
    id: uuid.UUID = Column(GUID(), primary_key=True, default=uuid.uuid4)

    user_id = Column(GUID(), ForeignKey("auth.users.id", ondelete="CASCADE"))
    user: User = relationship(User, backref="contacts")
    active = Column(Boolean, nullable=False, default=False, doc="Is this contact type active?")

    kind = Column(Enum(ContactKind))

    __mapper_args__: dict[str, Any] = {"polymorphic_on": kind}

    def revoke(self) -> None:
        """Revoke this authentication method"""
        self.active = False


class EmailContact(Contact):
    id: uuid.UUID = Column(
        GUID(), ForeignKey("auth.contacts.id", ondelete="CASCADE"), primary_key=True, default=uuid.uuid4
    )

    email = Column(String, nullable=False, doc="Contact Email")
    verified = Column(Boolean, nullable=False, default=False, doc="Is this email verified?")
