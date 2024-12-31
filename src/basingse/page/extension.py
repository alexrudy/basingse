from flask import current_app
from flask import Flask
from flask_login import current_user
from itsdangerous import URLSafeTimedSerializer


class ConfigurationError(Exception):
    """Raised when the extension is not configured correctly"""


EXTENSION_KEY = "bss-editorjs"
TOKEN_SALT = b"editorjs-image-token"
EXTENSION_SALT = "bss-editorjs"


class EditorJS:
    """Flask extension for EditorJS with Image support"""

    def __init__(self, app: Flask | None = None) -> None:

        if app is not None:
            self.init_app(app)

    def init_app(self, app: Flask) -> None:
        """Initialize the extension with a Flask app"""
        from . import views  # noqa: F401

        # Image upload authentication expires after 1 hour by defualt.
        app.config.setdefault("EDITORJS_IMAGE_TOKEN_EXPIRY", 60 * 60)

        if not hasattr(app, "extensions"):  # pragma: nocover
            app.extensions = {}

        app.extensions[EXTENSION_KEY] = self
        app.add_template_global(self.get_token, "editorjs_token")

    def serializer(self) -> URLSafeTimedSerializer:
        """Create a signer for image upload tokens"""
        assert current_app.secret_key is not None, "SECRET_KEY is not set"
        serializer = URLSafeTimedSerializer(current_app.secret_key, salt=self.salt)
        return serializer

    def get_token(self) -> str:
        """Get a token for an image"""
        return self.serializer().dumps(current_user.token)

    @property
    def token_max_age(self) -> int:
        """Get the max age of a token"""
        return current_app.config["EDITORJS_IMAGE_TOKEN_EXPIRY"]

    @property
    def salt(self) -> str:
        """Get the salt for the extension"""
        return EXTENSION_SALT

    def load_token(self, token: str) -> str:
        return self.serializer().loads(token, max_age=self.token_max_age, salt=self.salt)


def get_extension() -> EditorJS:
    return current_app.extensions[EXTENSION_KEY]
