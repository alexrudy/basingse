#!/usr/bin/env python
"""Tests for `basingse` package."""
from collections.abc import Iterator

import pytest
from flask import Flask


@pytest.fixture
def simple_app() -> Iterator[Flask]:
    app = Flask(__name__)
    app.config["TESTING"] = True

    yield app


def test_something(simple_app: Flask) -> None:
    pass
