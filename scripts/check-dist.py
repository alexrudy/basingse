#!/usr/bin/env python3
import contextlib
import dataclasses
import os
import subprocess
import sys
import tempfile
from collections.abc import Iterator
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import wait
from pathlib import Path

import click


@dataclasses.dataclass
class VirtualEnv:
    path: Path

    def run(self, *args: object) -> None:
        python = self.path / "bin" / "python"
        run(python, *args)


def run(*args: object) -> None:
    args = [str(arg) for arg in args]
    cmd = " ".join(args)
    ctx = click.get_current_context()

    if not ctx.meta.get("quiet", False):
        click.echo("{} {}".format(click.style(">", fg="blue", bold=True), cmd))

    verbose = ctx.meta.get("verbose", False)
    process = subprocess.run(
        args,
        stdout=subprocess.PIPE if not verbose else None,
        stderr=subprocess.STDOUT if not verbose else None,
        check=False,
    )
    if process.returncode != 0:
        click.echo(
            "{} {} failed with returncode {}".format(click.style("!", fg="red", bold=True), cmd, process.returncode),
            err=True,
        )

        if process.stdout:
            click.echo(process.stdout.decode(), err=True)
        raise click.ClickException(f"Command failed with return code {process.returncode}")


BUILD_COMMAND_ARG = {
    "sdist": "-s",
    "wheel": "-w",
}

BUILD_ARTIFACT_PATTERN = {
    "sdist": "*.tar.gz",
    "wheel": "*.whl",
}


def find_dist(location: Path, pattern: str) -> Path:
    candidates = sorted(location.glob(pattern), key=lambda p: p.stat().st_mtime, reverse=True)
    if not candidates:
        raise click.ClickException(f"No {pattern} found")
    return candidates[0]


@contextlib.contextmanager
def virtualenv(root: Path, name: str) -> Iterator[VirtualEnv]:
    """Create a virtualenv and yield the path to it."""
    run("python", "-m", "venv", str(root / name))
    yield VirtualEnv(root / name)
    run("rm", "-rf", str(root / name))


def check_dist(ctx: click.Context, package: str, dist: str, assets: bool = False) -> None:
    with ctx.scope(), tempfile.TemporaryDirectory() as tmp_directory:
        tmpdir = Path(tmp_directory)
        distdir = tmpdir / "dist"
        run(
            sys.executable,
            "-m",
            "build",
            BUILD_COMMAND_ARG[dist],
            ".",
            "--outdir",
            distdir,
        )

        with virtualenv(tmpdir, "venv-dist") as venv:
            venv.run("-m", "pip", "install", "--upgrade", "pip")
            sdist = find_dist(distdir, BUILD_ARTIFACT_PATTERN[dist])
            venv.run("-m", "pip", "install", str(sdist))

            venv.run("-c", f"import {package}; print({package}.__version__)")
            if assets:
                venv.run("-c", f"import {package}.assets; {package}.assets.check_dist()")

        with virtualenv(tmpdir, "venv-twine") as venv:
            venv.run("-m", "pip", "install", "twine")
            venv.run("-m", "twine", "check", sdist)

    click.secho(f"{dist} built and installed successfully", fg="green", bold=True)


@click.command()
@click.option("-v", "--verbose", is_flag=True, help="Enable verbose output")
@click.option("-q", "--quiet", is_flag=True, help="Enable quiet output")
@click.option("-a", "--assets", is_flag=True, help="Check assets")
@click.option("-t", "--timeout", default=60.0, help="Timeout for checking distribution")
@click.argument("toxinidir", type=str, required=True)
@click.pass_context
def main(
    ctx: click.Context,
    toxinidir: str,
    verbose: bool,
    quiet: bool,
    assets: bool,
    timeout: float,
) -> None:
    """Check distribution for package"""
    if os.environ.get("CI") == "true":
        verbose = True

    ctx.meta["quiet"] = quiet
    ctx.meta["verbose"] = verbose

    package = Path(toxinidir).name
    click.secho(f"Checking distribution for {package}", bold=True)

    with ThreadPoolExecutor() as executor:
        sdist = executor.submit(check_dist, ctx, package, "sdist", assets=assets)
        wheel = executor.submit(check_dist, ctx, package, "wheel", assets=assets)

        done, _ = wait([sdist, wheel], return_when="ALL_COMPLETED", timeout=timeout)

        for future in done:
            future.result()


if __name__ == "__main__":
    main()
