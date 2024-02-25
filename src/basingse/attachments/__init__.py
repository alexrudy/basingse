from basingse.models import Model
from flask import Flask
from flask_attachments import Attachments
from flask_attachments.extension import settings

__all__ = ["attachments", "settings"]

attachments = Attachments(registry=Model.registry)


def init_app(app: Flask) -> None:
    # Trigger blueprint registration
    from . import views  # noqa: F401

    attachments.init_app(app)
