from flask import Flask
from pytest_basingse.cli import Success

from basingse.customize.cli import init


def test_init(app: Flask) -> None:
    runner = app.test_cli_runner()

    result = runner.invoke(init)
    assert result == Success()
