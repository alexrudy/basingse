import dataclasses as dc
import uuid
from typing import cast

from sqlalchemy import select
from sqlalchemy.orm import object_session
from sqlalchemy.orm import Session as SASession

from .authentication import Authentication
from .authentication import AuthenticationKind
from .authentication import Session
from .user import User


@dc.dataclass
class Authorization:
    """Represents an authorized user in a scope."""

    source: Authentication

    def __repr__(self) -> str:

        username = getattr(self.user, "username", "")

        return f"{self.__class__.__name__}(user='{username}')"

    @property
    def id(self) -> uuid.UUID:
        return self.source.id

    @property
    def kind(self) -> AuthenticationKind:
        return self.source.kind

    @property
    def user(self) -> User:
        return self.source.user

    @property
    def is_active(self) -> bool:
        return self.user.is_active

    @property
    def is_authenticated(self) -> bool:
        return self.user.is_authenticated

    @property
    def is_anonymous(self) -> bool:
        return self.user.is_anonymous

    def get_id(self) -> str:
        """Generates a new session token for use as an authentication mechanism"""
        s = cast(SASession, object_session(self.user))

        stmt = select(Session).where(Session.user == self.user).limit(1)

        session = s.execute(stmt).scalar_one_or_none()
        if session is None:
            session = Session(user=self.user)
            s.add(session)
            s.commit()
        return session.token
