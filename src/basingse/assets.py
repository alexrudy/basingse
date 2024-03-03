import json
import os
from typing import Any

import structlog
from flask import current_app
from flask import Flask
from flask import send_from_directory
from flask.typing import ResponseReturnValue


logger = structlog.get_logger()


class Assets:

    def __init__(self, app: Flask | None = None) -> None:
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
        if current_app.config["DEBUG"]:
            return filename
        return self.assets[filename]

    def serve_asset(self, filename: str) -> ResponseReturnValue:

        if not current_app.config["DEBUG"]:
            max_age = current_app.get_send_file_max_age(filename)
        else:
            max_age = None

        if current_app.config["DEBUG"] and filename in self.assets:
            filename = self.assets[filename]

        conditional = not current_app.config["DEBUG"]
        etag = not current_app.config["DEBUG"]

        return send_from_directory(
            current_app.config["ASSETS_FOLDER"], filename, max_age=max_age, conditional=conditional, etag=etag
        )

    def reload_webpack_assets(self) -> None:
        self._get_webpack_assets(current_app)

    def _get_webpack_assets(self, app: Flask) -> None:
        with app.open_resource(self.manifest_path) as manifest:
            self.assets = json.load(manifest)
