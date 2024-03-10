import subprocess
from typing import Any

from hatchling.builders.hooks.plugin.interface import BuildHookInterface


def run(*args: str) -> None:
    subprocess.run(args, check=True)


class WebpackBuildHook(BuildHookInterface):

    def clean(self, versions: list[str]) -> None:
        run("rm", "-rf", "src/basingse/assets/*")

    def initialize(self, version: str, build_data: dict[str, Any]) -> None:
        run("npm", "install")
        run("npm", "run", "build")
