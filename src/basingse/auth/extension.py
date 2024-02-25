from typing import TypeVar

import structlog
from basingse import svcs
from flask import current_app
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from itsdangerous import URLSafeTimedSerializer
from sqlalchemy.orm import registry as Registry
from sqlalchemy.orm import Session

from .models import User
from .permissions import PermissionGrant
from .permissions import Role
from .permissions import RoleGrant

log = structlog.get_logger(__name__)


EXTENSION_KEY = "bss-authentication"

M = TypeVar("M")


def map_with_registry(registry: Registry, model: type[M]) -> None:
    """Map a model with the given registry"""
    if not hasattr(model, "__mapper__"):
        registry.map_declaratively(model)
    elif model.__table__ not in registry.metadata:  # type: ignore
        raise ConfigurationError(
            f"Model {model.__name__} has already been mapped to a different metadata"
            "\nConsider providing a custom registry to the extension"
            "\nor only intializing the extension once"
        )


def register_models(registry: Registry) -> None:
    for model in (User, Role, RoleGrant, PermissionGrant):
        map_with_registry(registry, model)


class ConfigurationError(Exception):
    """Raised when the extension is not configured correctly"""


class Authentication:
    """Flask extension for authentication

    :app: Flask app to initialize the extension. Optional, you can delay initialization
      and call init_app later
    :registry: SQLAlchemy registry to use for mapping the User model. If not provided,
        a new registry will be created, and is avaialble at `extension.registry`
        If you have a SQLAlchemy DeclarativeBase model class, you can find the registry
        as an attribute on the model class. This cannot be delayed by default because
        a class can only be associated with one registry.

    """

    home: str = "/"
    logged_in: str = "/"
    profile: str = "/"

    def __init__(self, app: Flask | None = None, registry: Registry | None = None) -> None:
        if registry is None:
            registry = Registry()
        register_models(registry)

        if app is not None:
            self.init_app(app)

    def init_app(self, app: Flask) -> None:
        """Initialize the extension with a Flask app"""
        from .cli import auth_cli
        from . import manager as manager_module  # noqa: F401
        from . import views
        from . import utils

        # Login links expire after 24 hours by default
        app.config.setdefault("LOGIN_LINK_EXPIRATION", 60 * 60 * 24)

        if not hasattr(app, "extensions"):  # pragma: no cover
            app.extensions = {}

        if not hasattr(app, "login_manager"):  # pragma: no cover
            manager = LoginManager()
            manager.init_app(app)

        self._bcrypt = Bcrypt()
        self._bcrypt.init_app(app)

        if "csrf" not in app.extensions:
            CSRFProtect(app=app)

        app.cli.add_command(auth_cli)
        app.extensions[EXTENSION_KEY] = self

        manager_module.init_extension(manager)
        views.init_app(app)
        utils.init_app(app)

    @property
    def session(self) -> Session:
        """Get a SQLAlchemy session"""
        return svcs.get(Session)

    @property
    def bcrypt(self) -> Bcrypt:
        """Get the Bcrypt instance"""
        return self._bcrypt

    @property
    def login_manager(self) -> LoginManager:
        """Get the LoginManager instance"""
        return current_app.login_manager  # type: ignore

    @property
    def csrf(self) -> CSRFProtect:
        """Get the CSRFProtect instance"""
        return current_app.extensions["csrf"]

    def serializer(self, salt: str) -> URLSafeTimedSerializer:
        """Get the serializer instance"""
        return URLSafeTimedSerializer(secret_key=current_app.config["SECRET_KEY"], salt=salt)


def get_extension() -> Authentication:
    return current_app.extensions[EXTENSION_KEY]
