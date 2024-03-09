#!/usr/bin/env python
"""The setup script."""
from setuptools import setup
from setuptools.command.build_ext import build_ext
from setuptools.command.sdist import sdist


def webpacker() -> None:
    from subprocess import run

    run(["npm", "ci"], check=True)
    run(["npm", "run", "build"], check=True)


class WebpackExtensions(build_ext):
    def run(self) -> None:
        webpacker()
        super().run()


class WebpackSdist(sdist):
    def run(self) -> None:
        webpacker()
        super().run()


setup(cmdclass={"build_ext": WebpackExtensions, "sdist": WebpackSdist})
