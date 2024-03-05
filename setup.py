#!/usr/bin/env python
"""The setup script."""
from setuptools import setup
from setuptools.command.sdist import sdist


class WebpackedSdist(sdist):
    def run(self) -> None:
        from subprocess import run

        run(["npm", "ci"], check=True)
        run(["npm", "run", "build"], check=True)
        super().run()


setup(cmdclass={"sdist": WebpackedSdist})
