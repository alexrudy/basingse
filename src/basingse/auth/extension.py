import dataclasses as dc

import structlog
from flask import current_app
from flask import Flask
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_wtf.csrf import CSRFProtect
from itsdangerous import URLSafeTimedSerializer

from .admin import UserAdmin  # noqa: F401
from basingse.utils.settings import BlueprintOptions

log = structlog.get_logger(__name__)

csrf = CSRFProtect()


EXTENSION_KEY = "bss-authentication"


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
    blueprint: BlueprintOptions = BlueprintOptions()

    def __init__(self, app: Flask | None = None) -> None:

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

        if not hasattr(app, "extensions"):  # pragma: nocover
            app.extensions = {}

        if not hasattr(app, "login_manager"):  # pragma: nocover
            manager = LoginManager()
            manager.init_app(app)
        else:
            manager = app.login_manager

        self._bcrypt = Bcrypt()
        self._bcrypt.init_app(app)

        if "csrf" not in app.extensions:
            csrf.init_app(app=app)

        app.cli.add_command(auth_cli)
        app.extensions[EXTENSION_KEY] = self

        manager_module.init_extension(manager)
        manager.blueprint_login_views[views.bp.name] = f"{views.bp.name}.login"
        manager.login_view = f"{views.bp.name}.login"
        app.register_blueprint(views.bp, **dc.asdict(self.blueprint))

        utils.init_app(app)

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
