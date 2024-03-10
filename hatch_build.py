import os.path
import subprocess
from typing import Any

from hatchling.builders.hooks.plugin.interface import BuildHookInterface


def run(*args: str) -> None:
    subprocess.run(args, check=True)


class WebpackBuildHook(BuildHookInterface):

    def clean(self, versions: list[str]) -> None:
        run("rm", "-rf", "src/basingse/assets/*")

    def initialize(self, version: str, build_data: dict[str, Any]) -> None:
        manifest = os.path.join(self.root, "src/basingse/assets/manifest.json")
        if os.path.exists(manifest):
            return

        package = os.path.join(self.root, "package.json")
        if not os.path.exists(package):
            raise FileNotFoundError("package.json not found")

        run("npm", "ci")
        run("npm", "run", "build")
