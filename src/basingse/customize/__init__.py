from flask import Flask

from .models import SiteSettings
from .models import SocialLink

__all__ = ["SiteSettings", "SocialLink"]


def init_app(app: Flask) -> None:
    from . import services
    from . import views
    from . import cli
    from . import admin

    admin.init_app(views.bp)
    services.init_app(app)
    app.register_blueprint(views.bp)
    cli.init_app(app)
