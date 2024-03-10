import dataclasses as dc
import importlib.resources
import io
import json
from pathlib import Path
from typing import Any

import structlog
from flask import current_app
from flask import Flask
from flask import send_file
from flask import send_from_directory
from flask.typing import ResponseReturnValue


logger = structlog.get_logger()


@dc.dataclass
class AssetCollection:
    location: str | Path
    manifest: Path
    directory: Path
    assets: dict[str, str] = dc.field(init=False)

    def __post_init__(self) -> None:
        self.assets = self._get_assets()

    def _get_assets(self) -> dict[str, str]:
        return json.loads(self.read_text(str(self.manifest)))

    def read_text(self, filename: str) -> str:
        if isinstance(self.location, Path):
            root = self.location / self.directory / filename
            return root.read_text()

        return importlib.resources.files(self.location).joinpath(str(self.directory), filename).read_text()

    def reload(self) -> None:
        self.assets = self._get_assets()

    def __contains__(self, filename: str) -> bool:
        return filename in self.assets

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
        if isinstance(self.location, Path):
            return send_from_directory(
                self.location / self.directory, filename, max_age=max_age, conditional=conditional, etag=etag
            )

        data = io.BytesIO(importlib.resources.files(self.location).joinpath(str(self.directory), filename).read_bytes())
        return send_file(data, download_name=filename, max_age=max_age, conditional=conditional, etag=etag)


@dc.dataclass()
class Assets:

    collection: list[AssetCollection] = dc.field(default_factory=list)
    app: dc.InitVar[Flask | None] = dc.field(
        default=None,
        init=True,
    )

    def __post_init__(self, app: Flask | None = None) -> None:
        if app is not None:
            self.init_app(app)

    def init_app(self, app: Flask) -> None:
        folder = app.config.get("ASSETS_FOLDER", None)

        # Always include local assets
        self.collection.append(AssetCollection("basingse", Path("manifest.json"), Path("assets")))

        if folder:
            self.collection.append(AssetCollection(Path(app.root_path), Path("manifest.json"), Path(folder)))

        app.add_url_rule("/assets/<path:filename>", "assets", self.serve_asset)

        if app.config.get("DEBUG"):
            for collection in self.collection:
                app.before_request(collection.reload)

        app.context_processor(self.context_processor)

    def context_processor(self) -> dict[str, Any]:
        return {"asset": self}

    def url(self, filename: str) -> str:
        if current_app.config["DEBUG"]:
            return filename
        for collection in self.collection:
            if filename in collection:
                return collection.url(filename)
        return filename

    def serve_asset(self, filename: str) -> ResponseReturnValue:
        for collection in self.collection:
            if filename in collection:
                return collection.serve_asset(filename)
        return "Not Found", 404


def check_dist() -> None:
    """Check the dist directory for the presence of asset files."""
    manifest = importlib.resources.files("basingse").joinpath("assets", "manifest.json").read_text()
    print(f"{len(json.loads(manifest))} asset files found")
