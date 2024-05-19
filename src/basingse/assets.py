import contextlib
import importlib.resources
import json
from collections.abc import Iterator
from collections.abc import Mapping
from importlib.resources.abc import Traversable
from pathlib import Path
from typing import Any
from typing import BinaryIO
from typing import cast

import attrs
import structlog
from flask import current_app
from flask import Flask
from flask import send_file
from flask import url_for
from flask.typing import ResponseReturnValue
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
class AssetLocation:
    """Where the assets are located."""

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


@attrs.define(frozen=True)
class Asset:
    """A single asset file"""

    #: The name of the asset on disk
    filename: str

    #: The manifest that contains this asset
    manifest: "AssetManifest"

    def has_extension(self, extension: str) -> bool:
        """Check if the asset has the given extension."""
        if not extension.startswith("."):
            extension = f".{extension}"
        return Path(self.filename).suffix == extension

    def url(self, **kwargs: Any) -> str:
        """Build the URL for the asset."""
        return self.manifest.url(self.filename, **kwargs)

    def filepath(self) -> str:
        return self.manifest.filepath(self.filename)

    def serve(self) -> ResponseReturnValue:
        """Serve the asset."""
        return self.manifest.serve(self.filename)

    def __str__(self) -> str:
        return self.url()


@attrs.define(frozen=True)
class AssetManifest(Mapping[str, Asset]):
    """
    Webpack's manifest.json file.

    This file contains the mapping of the original asset filename to the versioned asset filename.
    """

    #: The name of this manifest in the extension
    name: str

    #: The module or package where the assets are located
    location: AssetLocation

    #: Name of the manifest file
    manifest_path: Path = attrs.field(default=Path("manifest.json"))

    manifest: dict[str, str] = attrs.field(factory=dict)

    def __attrs_post_init__(self) -> None:
        self.manifest.clear()
        self.manifest.update(self._get_manifest())

    def _get_manifest(self) -> dict[str, str]:
        return json.loads(self.path(self.manifest_path).read_text())

    def path(self, filename: str | Path) -> Traversable:
        return self.location.path(filename)

    def filepath(self, filename: str) -> str:
        return self.manifest[filename]

    def reload(self) -> None:
        self.manifest.clear()
        self.manifest.update(self._get_manifest())

    def __contains__(self, filename: object) -> bool:
        return filename in self.manifest

    def __getitem__(self, filename: str) -> Asset:
        """Get the path to the asset, either from the manifest or the original path."""
        if filename not in self.manifest:
            raise KeyError(filename)
        return Asset(filename, self)

    def __iter__(self) -> Iterator[str]:
        return iter(self.manifest)

    def __len__(self) -> int:
        return len(self.manifest)

    def iter_assets(self, extension: str | None = None) -> Iterator[Asset]:
        if extension is not None and not extension.startswith("."):
            extension = f".{extension}"

        for filename in self.manifest.keys():
            if extension is None or Path(filename).suffix == extension:
                yield Asset(filename, self)

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

        return url_for("assets", bundle=self.name, filename=filename, **kwargs)

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
class Assets:

    manifests: dict[str, AssetManifest] = attrs.field(factory=dict)

    def __init__(self, app: Flask | None = None) -> None:
        self.manifests = {}
        self.append(AssetManifest(name="basingse", location=AssetLocation("basingse")))
        self.append(AssetManifest(name="admin", location=AssetLocation("basingse")))

        if app is not None:
            self.init_app(app)

    def init_app(self, app: Flask) -> None:
        app.config.setdefault("ASSETS_BUST_CACHE", not app.config["DEBUG"])
        if app.config.setdefault("ASSETS_AUTORELOAD", app.config["DEBUG"]):
            app.before_request(self.reload)

        app.add_url_rule("/assets/<bundle>/<path:filename>", "assets", self.serve_asset)

        app.extensions[_ASSETS_EXTENSION_KEY] = self
        svcs.register_value(app, Assets, self)

        app.context_processor(self.context_processor)

    def context_processor(self) -> dict[str, Any]:
        return {"assets": self}

    def append(self, manifest: AssetManifest) -> None:
        self.manifests[manifest.name] = manifest

    def __getitem__(self, bundle: str) -> AssetManifest:
        return self.manifests[bundle]

    def __contains__(self, bundle: str) -> bool:
        return bundle in self.manifests

    def __iter__(self) -> Iterator[str]:
        return iter(self.manifests)

    def __len__(self) -> int:
        return len(self.manifests)

    def iter_assets(self, bundle: str, extension: str | None = None) -> Iterator[Asset]:
        return self.manifests[bundle].iter_assets(extension)

    def url(self, bundle: str, filename: str, **kwargs: Any) -> str:
        return self.manifests[bundle].url(filename, **kwargs)

    def serve_asset(self, bundle: str, filename: str) -> ResponseReturnValue:
        manifest = self.manifests[bundle]
        return manifest.serve(filename)

    def reload(self) -> None:
        for manifest in self.manifests.values():
            manifest.reload()


def check_dist() -> None:
    """Check the dist directory for the presence of asset files."""
    manifest = importlib.resources.files("basingse").joinpath("assets", "manifest.json").read_text()
    print(f"{len(json.loads(manifest))} asset files found")
