from typing import Any

import pytest
from basingse.auth.extension import Authentication
from basingse.auth.extension import ConfigurationError
from flask import Flask
from flask_wtf.csrf import CSRFProtect


def test_extension_with_crsf(app: Flask, registry: Any) -> None:
    crsf = CSRFProtect(app=app)
    extension = Authentication(registry=registry)
    extension.init_app(app)

    with app.app_context():
        assert extension.csrf is crsf


def test_extension_duplicate_registry_fails(app: Flask, registry: Any) -> None:
    extension = Authentication(registry=registry)
    extension.init_app(app)

    with pytest.raises(ConfigurationError):
        Authentication(app=app)
