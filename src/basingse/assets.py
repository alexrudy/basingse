import dataclasses as dc
import importlib.resources
import io
import json
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import structlog
from flask import Blueprint
from flask import current_app
from flask import Flask
from flask import send_file
from flask import send_from_directory
from flask.typing import ResponseReturnValue

from . import svcs


logger = structlog.get_logger()

_ASSETS_EXTENSION_KEY = "basingse.assets"
_ASSETS_BUST_CACHE_KEY = "ASSETS_BUST_CACHE"


@dc.dataclass
class AssetCollection:
    location: str | Path
    manifest: Path
    directory: Path
    assets: dict[str, str] = dc.field(init=False)
    targets: set[str] = dc.field(init=False)

    def __post_init__(self) -> None:
        self.assets = self._get_assets()
        self.targets = {v for v in self.assets.values()}

    def _get_assets(self) -> dict[str, str]:
        return json.loads(self.read_text(str(self.manifest)))

    def read_text(self, filename: str) -> str:
        if isinstance(self.location, Path):
            root = self.location / self.directory / filename
            return root.read_text()

        return importlib.resources.files(self.location).joinpath(str(self.directory), filename).read_text()

    def reload(self) -> None:
        self.assets = self._get_assets()
        self.targets = {v for v in self.assets.values()}

    def __contains__(self, filename: str) -> bool:
        return filename in self.assets or filename in self.targets

    def __len__(self) -> int:
        return len(self.assets)

    def __iter__(self) -> Iterator[str]:
        return iter(self.assets)

    def url(self, filename: str) -> str:
        if not current_app.config[_ASSETS_BUST_CACHE_KEY]:
            return filename
        return self.assets[filename]

    def iter_assets(self, extension: str | None) -> Iterator[str]:
        for filename in self.assets:
            if extension is None or filename.endswith(extension):
                yield filename

    def serve_asset(self, filename: str) -> ResponseReturnValue:
        if current_app.config[_ASSETS_BUST_CACHE_KEY]:
            max_age = current_app.get_send_file_max_age(filename)
        else:
            max_age = None

        if not current_app.config[_ASSETS_BUST_CACHE_KEY] and filename in self.assets:
            filename = self.assets[filename]

        conditional = current_app.config[_ASSETS_BUST_CACHE_KEY]
        etag = current_app.config[_ASSETS_BUST_CACHE_KEY]
        if isinstance(self.location, Path):
            return send_from_directory(
                self.location / self.directory, filename, max_age=max_age, conditional=conditional, etag=etag
            )

        data = io.BytesIO(importlib.resources.files(self.location).joinpath(str(self.directory), filename).read_bytes())
        return send_file(data, download_name=filename, max_age=max_age, conditional=conditional, etag=etag)


@dc.dataclass()
class Assets:

    module: str | None = None
    collection: list[AssetCollection] = dc.field(default_factory=list)
    blueprint: Blueprint | None = dc.field(
        default=None,
    )
    app: dc.InitVar[Flask | None] = dc.field(
        default=None,
        init=True,
    )

    _blueprint_has_endpoint: bool = dc.field(default=False, init=False, repr=False)

    def __post_init__(self, app: Flask | None = None) -> None:
        if self.blueprint is not None and not self._blueprint_has_endpoint:
            self.blueprint.add_url_rule("/assets/<path:filename>", "assets", self.serve_asset)
            self._blueprint_has_endpoint = True
        if app is not None:
            self.init_app(app)

    def init_app(self, app: Flask) -> None:
        module = self.module or app.config.get("ASSETS_MODULE", "basingse")
        app.config.setdefault("ASSETS_BUST_CACHE", not app.config["DEBUG"])
        app.config.setdefault("ASSETS_AUTORELOAD", app.config["DEBUG"])

        # Always include local assets
        self.collection.append(AssetCollection(module, Path("manifest.json"), Path("assets")))

        if self.blueprint is not None:
            app.register_blueprint(self.blueprint)
            assert any(app.url_map.iter_rules(endpoint=f"{self.blueprint.name}.assets")), "No assets endpoint found"
        else:
            app.add_url_rule("/assets/<path:filename>", "assets", self.serve_asset)
            assert any(app.url_map.iter_rules(endpoint="assets")), "No assets endpoint found"

        if app.config.get("ASSETS_AUTORELOAD", False):
            app.before_request(self.reload)

        app.extensions[_ASSETS_EXTENSION_KEY] = self
        svcs.register_value(app, Assets, self)

        app.context_processor(self.context_processor)

    def append(self, collection: AssetCollection) -> None:
        self.collection.append(collection)

    def add_assets_folder(self, location: str | Path) -> None:
        self.collection.append(AssetCollection(location, Path("manifest.json"), Path("assets")))

    def context_processor(self) -> dict[str, Any]:
        return {"asset": self}

    def iter_assets(self, extension: str | None) -> Iterator[str]:
        for collection in self.collection:
            yield from collection.iter_assets(extension)

    def url(self, filename: str) -> str:
        if not current_app.config[_ASSETS_BUST_CACHE_KEY]:
            return filename
        for collection in self.collection:
            if filename in collection:
                return collection.url(filename)
        return filename

    def serve_asset(self, filename: str) -> ResponseReturnValue:
        for collection in self.collection:
            if filename in collection:
                logger.info("Serving asset", filename=filename, debug=True)
                return collection.serve_asset(filename)

        logger.warning("Asset not found", filename=filename, debug=True)
        return "Not Found", 404

    def reload(self) -> None:
        for collection in self.collection:
            collection.reload()


def check_dist() -> None:
    """Check the dist directory for the presence of asset files."""
    manifest = importlib.resources.files("basingse").joinpath("assets", "manifest.json").read_text()
    print(f"{len(json.loads(manifest))} asset files found")
