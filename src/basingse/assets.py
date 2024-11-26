import contextlib
import importlib.resources
import json
import re
from collections.abc import Iterator
from collections.abc import Mapping
from importlib.resources.abc import Traversable
from pathlib import Path
from typing import Any
from typing import BinaryIO
from typing import cast

import attrs
import structlog
from dominate import tags
from dominate.dom_tag import dom_tag
from dominate.util import container
from flask import current_app
from flask import Flask
from flask import send_file
from flask import url_for
from flask.typing import ResponseReturnValue
from markupsafe import Markup
from werkzeug.exceptions import NotFound

from . import svcs


logger = structlog.get_logger()

_ASSETS_EXTENSION_KEY = "basingse.assets"
_ASSETS_BUST_CACHE_KEY = "ASSETS_BUST_CACHE"


@contextlib.contextmanager
def handle_asset_errors() -> Iterator[None]:
    try:
        yield
    except FileNotFoundError as e:
        raise NotFound() from e
    except KeyError as e:
        raise NotFound() from e


@attrs.define(frozen=True)
class Asset:
    """A single asset file"""

    #: The name of the asset on disk
    filename: Path

    #: The manifest that contains this asset
    manifest: "AssetManifest"

    def has_extension(self, extension: str) -> bool:
        """Check if the asset has the given extension."""
        if not extension.startswith("."):
            extension = f".{extension}"
        return self.filename.suffix == extension

    def url(self, **kwargs: Any) -> str:
        """Build the URL for the asset."""
        return self.manifest.url(str(self.filename), **kwargs)

    def filepath(self) -> str:
        return self.manifest.filepath(str(self.filename))

    def serve(self) -> ResponseReturnValue:
        """Serve the asset."""
        return self.manifest.serve(str(self.filename))

    def resource(self) -> dom_tag:
        """Render the asset as a DOM element."""
        if self.has_extension(".js"):
            return tags.script(src=self.url())
        if self.has_extension(".css"):
            return tags.link(rel="stylesheet", href=self.url())

        return tags.a(href=self.url())

    def __html__(self) -> Markup:
        return Markup(self.resource())

    def __str__(self) -> str:
        return self.url()


@attrs.define(frozen=True, hash=False)
class AssetManifest(Mapping[str, Asset]):
    """
    Webpack's manifest.json file.

    This file contains the mapping of the original asset filename to the versioned asset filename.
    """

    #: The module or package where the assets are located
    location: Path | str | None = attrs.field(default=None)

    #: The location of the assets
    directory: Path = attrs.field(default=Path("assets"))

    def path(self, filename: str | Path) -> Traversable:
        """Get the traversal path to the filename."""
        if isinstance(self.location, Path):
            return self.location / self.directory / filename
        if self.location is None:
            return self.directory / filename

        return importlib.resources.files(self.location).joinpath(str(self.directory), str(filename))

    #: Name of the manifest file
    manifest_path: Path = attrs.field(default=Path("manifest.json"))

    manifest: dict[str, str] = attrs.field(factory=dict)

    def __attrs_post_init__(self) -> None:
        self.manifest.clear()
        self.manifest.update(self._get_manifest())

    def _get_manifest(self) -> dict[str, str]:
        return json.loads(self.path(self.manifest_path).read_text())

    def filepath(self, filename: str) -> str:
        return self.manifest[filename]

    def reload(self) -> None:
        self.manifest.clear()
        self.manifest.update(self._get_manifest())

    def __contains__(self, filename: object) -> bool:
        if isinstance(filename, Path):
            filename = filename.as_posix()
        if not isinstance(filename, str):
            return False
        filename = parse_filename(filename)
        logger.debug("Checking if asset is in manifest", filename=filename, manifest=set(self.manifest.keys()))
        return filename in self.manifest

    def __getitem__(self, filename: str) -> Asset:
        """Get the path to the asset, either from the manifest or the original path."""
        if filename not in self.manifest:
            raise KeyError(filename)
        return Asset(Path(filename), self)

    def __iter__(self) -> Iterator[str]:
        return iter(self.manifest)

    def __len__(self) -> int:
        return len(self.manifest)

    def __hash__(self) -> int:
        return hash((self.location, self.directory, self.manifest_path))

    def iter_assets(self, extension: str | None = None) -> Iterator[Asset]:
        if extension is not None and not extension.startswith("."):
            extension = f".{extension}"

        for filename in self.manifest.keys():
            filepath = Path(filename)
            if extension is None or filepath.suffix == extension:
                yield Asset(filepath, self)

    def url(self, filename: str, **kwargs: Any) -> str:
        """Build the URL for the asset.

        Parameters
        ----------
        filename : str
            The name of the asset to serve, with no hash attached.
        """
        if current_app.config[_ASSETS_BUST_CACHE_KEY]:
            try:
                filename = self.manifest[filename]
            except KeyError:
                logger.debug("Asset not found in manifest", filename=filename, manifest=self.manifest)
                raise
        else:
            if filename not in self.manifest:
                logger.debug("Asset not found in manifest", filename=filename, manifest=self.manifest)
                raise KeyError(filename)

        return url_for("assets", filename=filename, **kwargs)

    @handle_asset_errors()
    def serve(self, filename: str) -> ResponseReturnValue:
        """Serve an asset from the manifest.

        Parameters
        ----------
        filename : str
            The name of the asset to serve.
        """
        if not current_app.config[_ASSETS_BUST_CACHE_KEY]:
            try:
                filename = self.manifest[filename]
            except KeyError:
                logger.debug("Asset not found in manifest", filename=filename, manifest=self.manifest)
                raise
        elif filename not in self.manifest.values():
            logger.debug("Asset not found in manifest", filename=filename, manifest=self.manifest)
            raise KeyError(filename)

        conditional = current_app.config[_ASSETS_BUST_CACHE_KEY]

        asset = self.path(filename)

        if not asset.is_file():
            logger.debug("Asset not found at location", filename=filename, location=self.location)
            raise FileNotFoundError(filename)

        return send_file(cast(BinaryIO, asset.open("rb")), download_name=asset.name, conditional=conditional)


@attrs.define(init=False)
class Assets(Mapping[str, Asset]):
    """A collection of assets, served via multiple manifests."""

    manifests: set[AssetManifest]

    def __init__(self, app: Flask | None = None) -> None:
        self.manifests = set()
        self.add(AssetManifest(location="basingse"))

        if app is not None:
            self.init_app(app)

    def init_app(self, app: Flask) -> None:
        app.config.setdefault("ASSETS_BUST_CACHE", not app.config["DEBUG"])
        if app.config.setdefault("ASSETS_AUTORELOAD", app.config["DEBUG"]):
            app.before_request(self.reload)

        app.add_url_rule("/assets/<path:filename>", "assets", self.serve_asset)

        app.extensions[_ASSETS_EXTENSION_KEY] = self
        svcs.register_value(app, Assets, self)

        app.context_processor(self.context_processor)

    def context_processor(self) -> dict[str, Any]:
        return {"assets": self}

    def add(self, manifest: AssetManifest) -> None:
        self.manifests.add(manifest)

    def __getitem__(self, filename: str) -> Asset:
        for manifest in self.manifests:
            if filename in manifest:
                return manifest[filename]
        raise KeyError(filename)

    def __contains__(self, filename: object) -> bool:
        for manifest in self.manifests:
            if filename in manifest:
                return True
        return False

    def __iter__(self) -> Iterator[str]:
        for manifest in self.manifests:
            yield from manifest

    def __len__(self) -> int:
        return len(self.manifests)

    def iter_assets(self, bundle: str, extension: str | None = None) -> Iterator[Asset]:
        for manifest in self.manifests:
            for asset in manifest.iter_assets(extension):
                if asset.filename.name.startswith(bundle):
                    yield asset

    def resources(self, bundle: str, extension: str | None = None) -> dom_tag:
        """Render the assets as a DOM element."""
        collection = container()
        for asset in self.iter_assets(bundle, extension):
            collection.add(asset.resource())
        return collection

    def url(self, filename: str, **kwargs: Any) -> str:

        for manifest in self.manifests:
            if filename in manifest:
                return manifest.url(filename, **kwargs)
        raise KeyError(filename)

    def serve_asset(self, filename: str) -> ResponseReturnValue:
        for manifest in self.manifests:
            if filename in manifest:
                return manifest.serve(filename)

        logger.debug("Asset not found", filename=filename)
        raise NotFound(filename)

    def reload(self) -> None:
        for manifest in self.manifests:
            manifest.reload()


def check_dist() -> None:
    """Check the dist directory for the presence of asset files."""
    manifest = importlib.resources.files("basingse").joinpath("assets", "manifest.json").read_text()
    print(f"{len(json.loads(manifest))} asset files found")


def parse_filename(filename: str) -> str:
    """Parse the filename"""
    path = Path(filename)

    parts = path.name.split(".")
    if len(parts) < 3:
        return path.as_posix()

    module, name, hash, *extensions = parts

    if not re.match(r"^[a-f0-9]{32}$", hash):
        return path.as_posix()

    return path.with_name(f"{module}.{name}.{'.'.join(extensions)}").as_posix()
