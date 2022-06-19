import enum
import uuid
from typing import Any
from typing import cast

from basingse.models.types import GUID
from flask_login import AnonymousUserMixin
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy import select
from sqlalchemy import String
from sqlalchemy.orm import object_session
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Session as SASession

from .base import Base
from .base import Model


class AnonymousUser(AnonymousUserMixin):  # type: ignore
    @property
    def id(self) -> uuid.UUID:
        return uuid.UUID(int=0)

    @property
    def username(self) -> str:
        return "anonymous"

    @property
    def active(self) -> bool:
        return False


class User(Model):

    username = Column(String, nullable=False, unique=True, doc="Username")
    active: bool = Column(Boolean, nullable=False, default=False, doc="Is this user active?")

    @property
    def is_active(self) -> bool:
        return self.active

    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def is_anonymous(self) -> bool:
        return False

    def get_id(self) -> str:
        """Return an appropriate session ID for this user"""
        from .authentication import Session

        s = cast(SASession, object_session(self))

        stmt = select(Session).where(Session.user == self).limit(1)

        session = s.execute(stmt).scalar_one_or_none()
        if session is None:
            session = Session(user=self)
            s.add(session)
            s.commit()
        return session.token


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
