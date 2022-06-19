import datetime as dt
import enum
import functools
import secrets
import uuid
from collections.abc import Callable
from typing import Any
from typing import Optional

import pytz
from sqlalchemy import Boolean
from sqlalchemy import Column
from sqlalchemy import DateTime
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy import func
from sqlalchemy import String
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import relationship
from sqlalchemy.orm import validates
from werkzeug.security import check_password_hash
from werkzeug.security import generate_password_hash

from .base import Base
from .types import GUID
from .user import AnonymousUser
from .user import EmailContact
from .user import User

__all__ = ["AuthenticationKind", "Authentication", "Password", "Session", "Token", "Link"]


class AuthenticationKind(enum.Enum):
    ANONYMOUS = enum.auto()
    PASSWORD = enum.auto()
    SESSION = enum.auto()
    TOKEN = enum.auto()
    LINK = enum.auto()


class AuthenticationMixin:

    id: uuid.UUID
    user: User
    active: bool
    kind: AuthenticationKind

    def revoke(self) -> None:
        pass

    def check_capability(self, capability: str) -> bool:
        return False

    def _get_current_object(self) -> "AuthenticationMixin":
        return self


class AnonymousAuthentication(AuthenticationMixin):
    def __init__(self) -> None:
        self.user = AnonymousUser()
        self.active = False
        self.kind = AuthenticationKind.ANONYMOUS
        self.id = uuid.UUID(int=0)


class Authentication(Base, AuthenticationMixin):

    id: Mapped[uuid.UUID] = Column(GUID(), primary_key=True, default=uuid.uuid4)
    created = Column(DateTime(timezone=True), server_default=func.now())
    updated = Column(DateTime(timezone=True), onupdate=func.now(), default=func.now())

    user_id: Mapped[uuid.UUID] = Column(GUID(), ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False)
    user: User = relationship(User, backref="authentication_methods")

    active = Column(Boolean, nullable=False, default=False, doc="Is this authentication type active?")
    kind: AuthenticationKind = Column(Enum(AuthenticationKind), nullable=False)

    __mapper_args__: dict[str, Any] = {"polymorphic_on": kind}

    def revoke(self) -> None:
        """Revoke this authentication method"""
        self.active = False


class Password(Authentication):
    """Authentication via password"""

    __mapper_args__ = {
        "polymorphic_identity": AuthenticationKind.PASSWORD,
    }

    id: Mapped[uuid.UUID] = Column(
        GUID(), ForeignKey("auth.authentications.id", ondelete="CASCADE"), primary_key=True, default=uuid.uuid4
    )
    password = Column(String, nullable=False, doc="User's password for login")

    def __repr__(self) -> str:
        password = "'*****'" if self.password is not None else repr(None)
        return f"Password(id={self.id}, password={password})"

    @validates("password")
    def set_password(self, key: str, password: Optional[str]) -> Optional[str]:
        """Ensure that passwords are turned into hashed passwords before being sent to the DB"""

        if password is None:
            return None

        return generate_password_hash(password)

    def compare_password(self, candidate: str) -> bool:
        """Compare passwords using hash"""
        if self.password is None:
            # Password has not yet been set.
            return False

        return check_password_hash(self.password, candidate)


def _create_token(prefix: str) -> str:
    """Create a token for BaSingSe authentication"""
    token = secrets.token_hex(16)
    return f"{prefix}-{token}"


def default_token(prefix: str = "ba-sing-se") -> Callable[[], str]:
    return functools.partial(_create_token, prefix)


class Session(Authentication):
    """Authentication by session cookie"""

    __mapper_args__ = {
        "polymorphic_identity": AuthenticationKind.SESSION,
    }

    id: Mapped[uuid.UUID] = Column(
        GUID(), ForeignKey("auth.authentications.id", ondelete="CASCADE"), primary_key=True, default=uuid.uuid4
    )
    revoke_at: dt.datetime = Column(DateTime(), nullable=False, doc="When this session should be revoked")
    _token = Column("token", String(50), nullable=False, default=default_token("session"))

    @hybrid_property
    def token(self) -> str:
        if self._token is None:
            self._token = default_token("session")()
        return self._token

    @token.expression
    def _(cls) -> Column[String]:  # noqa: B902
        return cls._token  # type: ignore

    def expired(self, now: Optional[dt.datetime] = None) -> bool:
        if now is None:
            now = pytz.UTC.localize(dt.datetime.utcnow())

        return (not self.active) or (now.astimezone(pytz.UTC) < self.revoke_at)


class Token(Authentication):
    """Authentication by session cookie"""

    __mapper_args__ = {
        "polymorphic_identity": AuthenticationKind.TOKEN,
    }

    id: Mapped[uuid.UUID] = Column(GUID(), ForeignKey("auth.authentications.id"), primary_key=True, default=uuid.uuid4)
    _token = Column("token", String(50), nullable=False, default=default_token("ba-sing-se"))
    revoke_at = Column(DateTime(), nullable=False, doc="When this token should be revoked")

    @hybrid_property
    def token(self) -> str:
        if self._token is None:
            self._token = default_token("ba-sing-se")()
        return self._token

    @token.expression
    def _(cls) -> Column[String]:  # noqa: B902
        return cls._token  # type: ignore


class Link(Authentication):

    __mapper_args__ = {
        "polymorphic_identity": AuthenticationKind.LINK,
    }

    id: Mapped[uuid.UUID] = Column(
        GUID(), ForeignKey("auth.authentications.id", ondelete="CASCADE"), primary_key=True, default=uuid.uuid4
    )
    email_id = Column(GUID(), ForeignKey("auth.emailcontacts.id", ondelete="CASCADE"))
    email: EmailContact = relationship(EmailContact)
    _token = Column("token", String(50), nullable=False, default=default_token("link"))

    @hybrid_property
    def token(self) -> str:
        if self._token is None:
            self._token = default_token("link")()
        return self._token

    @token.expression
    def _(cls) -> Column[String]:  # noqa: B902
        return cls._token  # type: ignore
