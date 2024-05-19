from collections.abc import Iterator
from pathlib import Path
from typing import Self

import attrs
from dominate import tags
from dominate.dom_tag import dom_tag
from dominate.util import container
from flask import current_app
from flask import request

from basingse.assets import Asset
from basingse.assets import AssetManifest


@attrs.define
class ResourceBundle:

    name: str

    scope: str | None = attrs.field(default=None)

    assets: list[Asset] = attrs.field(factory=list)

    active: bool = attrs.field(default=True)

    def add(self, asset: Asset) -> None:
        self.assets.append(asset)

    @property
    def is_in_scope(self) -> bool:
        return (
            self.active
            and self.scope is None
            or (self.scope is not None and request.endpoint is not None and request.endpoint.startswith(self.scope))
        )

    def iter_assets(self, extension: str | None = None) -> Iterator[Asset]:
        for asset in self.assets:
            if extension is None or asset.has_extension(extension):
                yield asset

    def styles(self) -> dom_tag:
        styles = container()

        for asset in self.iter_assets("css"):
            styles.add(tags.link(rel="stylesheet", href=asset.url))

        return styles

    def scripts(self) -> dom_tag:
        scripts = container()

        for asset in self.iter_assets("js"):
            scripts.add(tags.script(src=asset.url))

        return scripts

    @classmethod
    def from_manifest(cls, name: str, manifest: AssetManifest, scope: str | None = None) -> "Self":
        bundle = cls(name=name, scope=scope)

        for asset in manifest.values():
            bundle.add(asset)

        return bundle

    @classmethod
    def from_manifest_with_prefix(
        cls, name: str, prefix: str, manifest: AssetManifest, scope: str | None = None
    ) -> "Self":
        bundle = cls(name=name, scope=scope)

        for filename, asset in manifest.items():
            if Path(filename).name.startswith(prefix):
                bundle.add(asset)

        return bundle


class DebugResourceBundle(ResourceBundle):
    @property
    def is_in_scope(self) -> bool:
        return current_app.config["DEBUG"] and super().is_in_scope
