#!/usr/bin/env python3
import pathlib
import subprocess
import sys


def check_minimal():
    """Check if the package can be imported."""
    project = pathlib.Path(__file__).parent.name
    print(f"Checking minimal for project: {project}")

    subprocess.run([sys.executable, "-c", f"import {project}"], check=True)


if __name__ == "__main__":
    check_minimal()
