from flask import Flask

from basingse.customize.cli import init
from basingse.testing.cli import Success


def test_init(app: Flask) -> None:
    runner = app.test_cli_runner()

    result = runner.invoke(init)
    assert result == Success()
