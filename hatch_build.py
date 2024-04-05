import os.path
import subprocess
from typing import Any

from hatchling.builders.hooks.plugin.interface import BuildHookInterface


class WebpackBuildHook(BuildHookInterface):

    def check_command(self, command: str | list[str], **kwargs: Any) -> None:
        if self.app.verbosity > 1:
            kwargs.setdefault("capture_output", False)
        else:
            kwargs.setdefault("capture_output", True)
        subprocess.run(command, **kwargs)

    def _assets(self) -> str:
        if (assets := self.config.get("assets")) is not None:
            return assets
        self.app.display_error("missing assets configuration")
        self.app.abort("assets configuration is required")
        raise AssertionError("unreachable code")

    def clean(self, versions: list[str]) -> None:

        if assets := self.config.get("assets") is not None:
            self.check_command(["rm", "-rf", f"{assets}/*"])

    def build_assets(self, version: str, build_data: dict[str, Any]) -> None:
        assets = self._assets()
        package = os.path.join(self.root, "package.json")
        if not os.path.exists(package):
            self.app.display_error(f"expected {package}")
            self.app.abort("package.json not found, package is mis-configured")

        build_data.get("artifacts", []).append(f"{assets}/*")
        if os.path.exists(os.path.join(assets, "manifest.json")):
            self.app.display_info("found existing manifest.json")
            return

        self.app.display_waiting("building webpack bundled assets...")
        self.check_command(["npm", "ci"])
        self.check_command(["npm", "run", "build"])

    def initialize(self, version: str, build_data: dict[str, Any]) -> None:

        assets = self._assets()

        manifest = os.path.join(self.root, assets, "manifest.json")
        if os.path.exists(manifest) and os.path.isfile(manifest):
            self.app.display_info("found existing manifest.json")
            build_data.get("artifacts", []).append(f"{assets}/*")
            return

        self.build_assets(version, build_data)
