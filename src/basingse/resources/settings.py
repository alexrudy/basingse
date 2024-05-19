from collections.abc import Iterator
from collections.abc import Mapping
from typing import Any

import attrs
from flask import Flask

from .bundle import DebugResourceBundle
from .bundle import ResourceBundle
from basingse.assets import Assets


@attrs.define
class AssetBundles(Mapping[str, "ResourceBundle"]):

    bundles: dict[str, "ResourceBundle"] = attrs.field(factory=dict)

    def add(self, bundle: ResourceBundle) -> None:
        self.bundles[bundle.name] = bundle

    def __getitem__(self, name: str) -> ResourceBundle:
        return self.bundles[name]

    def __contains__(self, name: object) -> bool:
        return name in self.bundles

    def __iter__(self) -> Iterator[str]:
        return iter(self.bundles)

    def __len__(self) -> int:
        return len(self.bundles)

    def init_app(self, app: Flask) -> None:
        app.context_processor(self.context_processor)

    def context_processor(self) -> dict[str, Any]:
        return {"bundles": self}

    def active(self) -> Iterator[ResourceBundle]:
        for bundle in self.bundles.values():
            if bundle.is_in_scope:
                yield bundle


def builtin_bundles(bundles: AssetBundles, assets: Assets) -> AssetBundles:
    bundles.add(ResourceBundle.from_manifest_with_prefix("admin", "basingse.admin", assets["basingse"], scope="admin"))
    bundles.add(DebugResourceBundle.from_manifest_with_prefix("debug", "basingse.debug", assets["basingse"]))
    bundles.add(ResourceBundle.from_manifest_with_prefix("basingse.main", "basingse.main", assets["basingse"]))
    bundles.add(ResourceBundle.from_manifest_with_prefix("bootstrap", "basingse.bootstrap", assets["basingse"]))

    return bundles
