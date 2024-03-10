#!/usr/bin/env python3
import contextlib
import os
import subprocess
from collections.abc import Iterator
from pathlib import Path

import click

run_verbose = False


def run(*args: str) -> None:
    cmd = " ".join(args)
    click.echo("{} {}".format(click.style(">", fg="blue", bold=True), cmd))

    process = subprocess.run(args, capture_output=(not run_verbose))
    if process.returncode != 0:
        click.echo(
            "{} {} failed with returncode {}".format(click.style("!", fg="red", bold=True), cmd, process.returncode),
            err=True,
        )
        if not run_verbose:
            click.echo(process.stdout.decode())
            click.echo(process.stderr.decode(), err=True)
        raise click.ClickException(f"Command failed with return code {process.returncode}")


def python(venv: Path, *args: str) -> None:
    pybinary = venv / "bin" / "python"
    run(str(pybinary), *args)


def dist(location: Path, pattern: str) -> Path:
    candidates = sorted(location.glob(pattern), key=lambda p: p.stat().st_mtime, reverse=True)
    if not candidates:
        raise click.ClickException("No sdist found")
    return candidates[0]


def clean() -> None:
    run("rm", "-rf", "src/basingse/assets/*")
    run("rm", "-rf", "dist")


@contextlib.contextmanager
def virtualenv(root: Path, name: str) -> Iterator[Path]:
    run("python", "-m", "venv", str(root / name))
    yield root / name
    run("rm", "-rf", str(root / name))


def check(venv: Path) -> None:
    python(venv, "-c", "import basingse; print(basingse.__version__)")
    python(venv, "-c", "import basingse.assets; basingse.assets.check_dist()")
    python(venv, "-m", "pip", "install", "twine")
    python(venv, "-m", "twine", "check", "dist/basingse-*")


def sdist() -> None:
    clean()
    run("python", "-m", "build", "-s", ".")
    with virtualenv(Path("dist"), "venv-sdist") as venv:
        python(venv, "-m", "pip", "install", "--upgrade", "pip")
        sdist = dist(Path("dist/"), "*.tar.gz")
        python(venv, "-m", "pip", "install", str(sdist))
        check(venv)
    click.secho("sdist built and installed successfully", fg="green", bold=True)


def wheel() -> None:
    clean()
    run("python", "-m", "build", "-w", ".")
    with virtualenv(Path("dist"), "venv-wheel") as venv:
        wheel = dist(Path("dist/"), "*.whl")
        python(venv, "-m", "pip", "install", str(wheel))
        check(venv)
    click.secho("wheel built and installed successfully", fg="green", bold=True)


@click.command()
@click.option("-v", "--verbose", is_flag=True, help="Enable verbose output")
def main(verbose: bool) -> None:
    global run_verbose
    if os.environ.get("CI") == "true":
        verbose = True

    run_verbose = verbose
    sdist()
    wheel()


if __name__ == "__main__":
    main()
