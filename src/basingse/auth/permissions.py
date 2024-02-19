import dataclasses as dc
import enum
import uuid
from functools import wraps
from typing import Any
from typing import Callable
from typing import cast
from typing import overload
from typing import Protocol
from typing import TYPE_CHECKING
from typing import TypeVar

import flask_login.config
import structlog
from flask import current_app
from flask import request
from flask.typing import ResponseReturnValue
from flask.typing import RouteCallable
from flask_login import current_user
from sqlalchemy import Boolean
from sqlalchemy import Enum
from sqlalchemy import ForeignKey
from sqlalchemy import select
from sqlalchemy import String
from sqlalchemy import Uuid
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy.ext.associationproxy import AssociationProxy
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

if TYPE_CHECKING:
    from .models import User

log = structlog.get_logger(__name__)


class Action(enum.Enum):
    VIEW = "view"
    EDIT = "edit"
    DELETE = "delete"
    SELF = "self"


@dc.dataclass
class Permission:
    model: str
    action: Action

    @overload
    def __init__(self, model: str, action: str | Action) -> None:  # pragma: no cover
        ...

    @overload
    def __init__(self, permission: tuple[str, str | Action], /) -> None:  # pragma: no cover
        ...

    def __init__(self, model: tuple[str, str | Action] | str, action: str | Action | None = None) -> None:
        if action is not None:
            pass
        elif isinstance(model, tuple):
            model, action = model
        elif isinstance(model, str):
            model, action = model.split(".")

        if not isinstance(model, str):  # pragma: no cover
            raise TypeError(f"model must be a string, not {type(model)}")

        self.model = model
        if isinstance(action, str):
            self.action = Action[action.upper()]
        else:
            self.action = action

    def __repr__(self) -> str:
        return f"<Permission {self.model}.{self.action.name.lower()}>"


R = TypeVar("R", covariant=True)
S = TypeVar("S", covariant=True)


class Permissionable(Protocol[S, R]):  # pragma: no cover
    @overload
    def __call__(self: S, permission: Permission) -> R: ...

    @overload
    def __call__(self: S, permission: str) -> R: ...

    @overload
    def __call__(self: S, permission: tuple[str, str | Action]) -> R: ...

    @overload
    def __call__(self: S, model: str, action: str | Action, /) -> R: ...

    def __call__(self: S, permission: Any, action: str | Action | None = None) -> Any:
        pass


def permissionable(func: Callable[[S, Permission], R]) -> Permissionable[S, R]:
    """Decorator to make a function permissionable. This allows the function to accept a permission as the first argument."""

    @wraps(func)
    def inner_permissionable(self: Any, permission: Any, action: str | Action | None = None) -> R:
        if action is not None:
            permission = Permission(permission, action)
        elif not isinstance(permission, Permission):
            permission = Permission(permission)

        return func(self, permission)

    return cast(Permissionable[S, R], inner_permissionable)


class PermissionGrant:
    """A specific permission granted to a role"""

    __tablename__ = "permission_grants"

    if TYPE_CHECKING:

        @overload
        def __init__(self, *, role_id: uuid.UUID, model: str, action: Action) -> None: ...

        @overload
        def __init__(self, *, role: "Role", model: str, action: Action) -> None: ...

        @overload
        def __init__(self, *, model: str, action: Action) -> None: ...

        def __init__(self, **kwargs):  # type: ignore
            ...

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, doc="Grant ID", default=uuid.uuid4)
    role_id: Mapped[uuid.UUID] = mapped_column(Uuid(), ForeignKey("roles.id"), nullable=False, doc="Role ID")
    role: Mapped["Role"] = relationship("Role", back_populates="grants")
    model: Mapped[str] = mapped_column(String(), nullable=False, doc="Model")
    action: Mapped[Action] = mapped_column(Enum(Action), nullable=False, doc="Permission")

    def __repr__(self) -> str:
        return f"<PermissionGrant {self.model}.{self.action.name.lower()}>"

    @property
    def permission(self) -> Permission:
        return Permission(model=self.model, action=self.action)

    @classmethod
    def from_permission(cls, permission: Permission) -> "PermissionGrant":
        return cls(model=permission.model, action=permission.action)


class Role:
    """A role that can be granted to a user"""

    __tablename__ = "roles"

    if TYPE_CHECKING:

        def __init__(self, *, name: str | None = None, administrator: bool | None = None) -> None: ...

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, doc="Role ID", default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(), nullable=False, unique=True, doc="Role name")
    administrator: Mapped[bool] = mapped_column(Boolean, default=False, doc="Is this an administrator grant?")

    grants: Mapped[set["PermissionGrant"]] = relationship(
        "PermissionGrant", back_populates="role", cascade="all, delete-orphan", lazy="selectin", collection_class=set
    )

    permissions: AssociationProxy[set[Permission]] = association_proxy(
        "grants",
        "permission",
        creator=PermissionGrant.from_permission,
    )

    users: Mapped[list["User"]] = relationship("User", secondary="role_grants", back_populates="roles", lazy="selectin")

    def __repr__(self) -> str:
        if self.administrator:
            return f"<Role {self.name} (administrator)>"
        return f"<Role {self.name}>"

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, Role):
            return NotImplemented
        return self.id == other.id

    @permissionable
    def can(self, permission: Permission) -> bool:
        """Check if this role has a permission"""

        if self.administrator:
            return True
        return permission in self.permissions

    @permissionable
    def grant(self, permission: Permission) -> None:
        if not self.can(permission):
            self.permissions.add(permission)

    @permissionable
    def revoke(self, permission: Permission) -> None:
        self.permissions.discard(permission)


class RoleGrant:
    """A specific role granted to a user"""

    __tablename__ = "role_grants"

    if TYPE_CHECKING:

        def __init__(self, *, user_id: uuid.UUID, role_id: uuid.UUID) -> None: ...

    id: Mapped[uuid.UUID] = mapped_column(Uuid(), primary_key=True, doc="Grant ID", default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(Uuid(), ForeignKey("users.id"), nullable=False, doc="User ID")
    role_id: Mapped[uuid.UUID] = mapped_column(Uuid(), ForeignKey("roles.id"), nullable=False, doc="Role ID")

    def __repr__(self) -> str:
        return f"<RoleGrant user={self.user_id} role={self.role_id}>"


@overload
def require_permission(
    model: str, action: str | Action, /
) -> Callable[[RouteCallable], RouteCallable]:  # pragma: no cover
    ...


@overload
def require_permission(permission: Permission) -> Callable[[RouteCallable], RouteCallable]:  # pragma: no cover
    ...


@overload
def require_permission(
    permission: str | tuple[str, str | Action]
) -> Callable[[RouteCallable], RouteCallable]:  # pragma: no cover
    ...


def require_permission(
    permission: Any,
    action: Any = None,
) -> Callable[[RouteCallable], RouteCallable]:
    """Decorator to require a permission for a route"""
    if action is not None:
        permission = Permission(permission, action)
    elif not isinstance(permission, Permission):
        permission = Permission(permission)

    def wrapper(func: RouteCallable) -> RouteCallable:
        @wraps(func)
        def decorated_view(*args: Any, **kwargs: Any) -> ResponseReturnValue:
            if request.method in flask_login.config.EXEMPT_METHODS or current_app.config.get("LOGIN_DISABLED", False):
                return current_app.ensure_sync(func)(*args, **kwargs)
            elif not current_user.is_authenticated:
                return current_app.login_manager.unauthorized()  # type: ignore[attr-defined]

            if current_user.can(permission):
                return current_app.ensure_sync(func)(*args, **kwargs)

            log.warning("Permission denied", user=current_user, permission=permission)
            return current_app.login_manager.unauthorized()  # type: ignore[attr-defined]

        return decorated_view

    return wrapper


def create_administrator(email: str, password: str) -> "User":
    """Initialize the administrator user if it doesn't exist"""
    from .extension import get_extension
    from .models import User

    session = get_extension().session

    user = session.execute(select(User).where(User.email == email).limit(1)).scalar_one_or_none()
    if user is None:
        user = User(email=email, active=True)
        log.info("Creating user", user=user)
    else:
        log.info("Updating user", user=user)

    user.password = password

    role = session.execute(select(Role).where(Role.administrator).limit(1)).scalar_one_or_none()
    if role is None:
        role = Role(name="admin", administrator=True)
        log.info("Creating administrator", role=role)

    if role.users:
        # We don't want to create a second administrator by accident.
        log.info("Administrator already exists", role=role)
    else:
        user.roles.append(role)

    session.add(user)
    session.commit()
    return user