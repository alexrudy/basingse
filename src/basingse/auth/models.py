import datetime as dt
import secrets
from typing import Any

import pytz
import structlog
import wtforms
from bootlace.table import Heading
from bootlace.table.columns import CheckColumn
from bootlace.table.columns import Column
from bootlace.table.columns import EditColumn
from flask import current_app
from flask import url_for
from flask_login import AnonymousUserMixin
from flask_login import login_user
from flask_login import logout_user
from marshmallow import fields
from sqlalchemy import Boolean
from sqlalchemy import DateTime
from sqlalchemy import select
from sqlalchemy import String
from sqlalchemy.orm import deferred
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import Session
from sqlalchemy.orm import validates
from wtforms.validators import Email as EmailValidator
from wtforms_sqlalchemy.fields import QueryCheckboxField

from .forms import BSListWidget
from .forms import get_query_roles
from .permissions import Permission
from .permissions import permissionable
from .permissions import Role
from basingse.models import Model
from basingse.models.info import FormInfo
from basingse.models.info import SchemaInfo
from basingse.models.orm import column
from basingse.models.orm import relationship

__all__ = ["User"]

logger = structlog.get_logger(__name__)


class RoleColumn(Column):
    def cell(self, item: Any) -> Any:
        return ", ".join(role.name for role in getattr(item, self.attribute))


class User(Model):

    email: Mapped[str] = deferred(
        column(
            String(),
            nullable=False,
            unique=True,
            doc="User's email address",
            schema=SchemaInfo(),
            form=fields.Email(validate=[EmailValidator(granular_message=True)]),
            listview=EditColumn("Email", attribute="email"),
        )
    )
    password: Mapped[str | None] = column(
        String(),
        nullable=True,
        doc="Password",
        schema=SchemaInfo(load_only=True),
        form=wtforms.PasswordField("Password", validators=[wtforms.validators.DataRequired()]),
    )

    active: Mapped[bool] = column(
        Boolean(),
        default=False,
        doc="Is this user active?",
        schema=SchemaInfo(load_default=False),
        form=FormInfo(),
        listview=CheckColumn(Heading("Active", icon="check"), "is_active"),
    )
    token: Mapped[str] = column(
        String(),
        default=lambda: secrets.token_hex(32),
        nullable=False,
        index=True,
        unique=True,
        schema=SchemaInfo(load_only=True),
        form=None,
    )
    last_login: Mapped[dt.datetime | None] = column(
        DateTime(), default=None, nullable=True, schema=SchemaInfo(dump_only=True), form=None
    )
    roles: Mapped[list[Role]] = relationship(
        "Role",
        secondary="role_grants",
        back_populates="users",
        lazy="selectin",
        schema=fields.Function(lambda obj: [role.name for role in obj.roles], dump_only=True),
        form=QueryCheckboxField(
            "Roles", get_label="name", query_factory=get_query_roles, widget=BSListWidget(prefix_label=False)
        ),
        listview=RoleColumn("Roles"),
    )

    def get_id(self) -> str:
        return self.token

    def reset_token(self) -> None:
        self.token = secrets.token_hex(32)

    @property
    def last_login_at(self) -> dt.datetime | None:
        if self.last_login is None:
            return None
        return pytz.utc.localize(self.last_login.replace(microsecond=0))

    @property
    def displayname(self) -> str:
        return self.email or "anonymous"

    @validates("password")
    def set_password(self, key: str, password: str | None) -> str | None:
        """Ensure that passwords are turned into hashed passwords before being sent to the DB"""
        from .extension import get_extension

        if password is None:
            return None

        return get_extension().bcrypt.generate_password_hash(password).decode("utf-8")

    def compare_password(self, candidate: str) -> bool:
        """Compare passwords using hash"""
        from .extension import get_extension

        if self.password is None:
            # Password has not yet been set.
            return False

        return get_extension().bcrypt.check_password_hash(self.password, candidate)

    @property
    def is_active(self) -> bool:
        return self.active

    @property
    def is_authenticated(self) -> bool:
        return True

    @property
    def is_anonymous(self) -> bool:
        return False

    @property
    def is_administrator(self) -> bool:
        return any(role.administrator for role in self.roles)

    @permissionable
    def can(self, permission: Permission) -> bool:
        return any(role.can(permission) for role in self.roles)

    def __repr__(self) -> str:
        password = "'*****'" if self.password is not None else repr(None)
        return f"User(id={self.id}, email={self.email}, password={password})"

    def link(self) -> str:
        """Get a login link for this user"""
        from .extension import get_extension

        serializer = get_extension().serializer("login-link")
        token = serializer.dumps(self.token)

        return url_for("auth.login", token=token, _external=True)

    @classmethod
    def login(cls, session: Session, email: str, password: str) -> bool:
        user = session.execute(select(cls).where(cls.email == email).limit(1)).scalar_one_or_none()
        if user and user.compare_password(password):
            if login_user(user):
                user.last_login = dt.datetime.utcnow()
                return True
            else:
                logout_user()
                logger.info("Login attempt with invalid user", user=user)
        elif user:
            logout_user()
            logger.info("Login attempt with bad password", email=email)
        else:
            logout_user()
            logger.info("Login attempt with unknown email", email=email)
        return False


class AnonymousUser(AnonymousUserMixin):
    def can(self, action: str) -> bool:
        if current_app.config.get("LOGIN_DISABLED", False):
            return True
        return False

    def compare_password(self, candidate: str) -> bool:
        return False
