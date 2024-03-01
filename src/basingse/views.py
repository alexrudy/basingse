import dataclasses as dc
import json
import os
from typing import Any

import structlog
from basingse import svcs
from basingse.customize.services import get_site_settings
from basingse.page.models import Page
from flask import abort
from flask import current_app
from flask import flash
from flask import Flask
from flask import render_template
from flask import send_from_directory
from flask.typing import ResponseReturnValue
from flask_login import current_user
from sqlalchemy.orm import Session

logger = structlog.get_logger()


def home() -> ResponseReturnValue:
    settings = get_site_settings()
    session = svcs.get(Session)

    if settings.homepage_id is not None and (homepage := session.get(Page, settings.homepage_id)) is None:
        if current_user.is_authenticated:
            flash("No homepage found, please set one in the admin interface", "warning")
        logger.warning(
            "No homepage found, please set one in the admin interface", settings=settings, homepage=settings.homepage_id
        )
        abort(404)

    return render_template("page.html", page=homepage)


class Assets:

    def __init__(self, app: Flask | None) -> None:
        if app is not None:
            self.init_app(app)

    def init_app(self, app: Flask) -> None:
        app.config.setdefault("ASSETS_FOLDER", "assets")

        self.manifest_path = os.path.join(app.config["ASSETS_FOLDER"], "manifest.json")

        app.add_url_rule("/assets/<path:filename>", "assets", self.serve_asset)

        if app.config.get("DEBUG"):
            app.before_request(self.reload_webpack_assets)

        app.context_processor(self.context_processor)

    def context_processor(self) -> dict[str, Any]:
        return {"asset": self}

    def url(self, filename: str) -> str:
        return self.assets[filename]

    def serve_asset(self, filename: str) -> ResponseReturnValue:
        logger.debug("Serving asset", filename=filename)

        if not current_app.config["DEBUG"]:
            max_age = current_app.get_send_file_max_age(filename)
        else:
            max_age = None
        return send_from_directory(current_app.config["ASSETS_FOLDER"], filename, max_age=max_age)

    def reload_webpack_assets(self) -> None:
        self._get_webpack_assets(current_app)

    def _get_webpack_assets(self, app: Flask) -> None:
        with app.open_resource(self.manifest_path) as manifest:
            self.assets = json.load(manifest)
        logger.debug("Loaded webpack assets", assets=self.assets)


@dc.dataclass(frozen=True)
class CoreSettings:
    def init_app(self, app: Flask) -> None:
        app.add_url_rule("/", "home", home)
        Assets(app)
