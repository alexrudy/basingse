from typing import Any

import pytest
from flask import Flask
from flask import request

from basingse.utils.urls import rewrite_endpoint
from basingse.utils.urls import rewrite_update
from basingse.utils.urls import rewrite_url


@pytest.mark.parametrize(
    "request_url,parameters,expected",
    [
        pytest.param("http://example.com", {"a": "b"}, "http://example.com/?a=b", id="simple"),
        pytest.param("http://example.com?c=d", {"a": "b"}, "http://example.com/?c=d&a=b", id="existing"),
        pytest.param("http://example.com?c=d", {"c": "e"}, "http://example.com/?c=e", id="overwrite"),
    ],
)
def test_rewrite_url(app: Flask, request_url: str, parameters: dict[str, str], expected: str) -> None:
    app.config["SERVER_NAME"] = "example.com"
    with app.test_request_context(request_url):
        assert rewrite_url(request, **parameters) == expected


@pytest.mark.parametrize(
    "request_url,parameters,expected",
    [
        pytest.param("http://example.com/testing/1", {"id": 2}, "/testing/2", id="simple"),
        pytest.param("http://example.com/testing/1", {"a": "b"}, "/testing/1?a=b", id="parameters"),
        pytest.param("http://example.com/testing/1?c=d", {"c": "e"}, "/testing/1?c=e", id="overwrite"),
    ],
)
def test_rewrite_endpoint(app: Flask, request_url: str, parameters: dict[str, Any], expected: str) -> None:
    app.config["SERVER_NAME"] = "example.com"
    app.add_url_rule("/testing/<int:id>", "testing", lambda id: id)

    with app.test_request_context(request_url):
        assert rewrite_endpoint(request, **parameters) == expected


@pytest.mark.parametrize(
    "request_url,parameters,expected",
    [
        pytest.param("http://example.com/testing/1", {"id": 2}, "/testing/2", id="simple"),
        pytest.param("http://example.com/", {"a": "b"}, "/testing/1?a=b", id="parameters"),
        pytest.param("http://example.com/?c=d", {"c": "e"}, "/testing/1?c=e", id="overwrite"),
    ],
)
def test_update_endpoint(app: Flask, request_url: str, parameters: dict[str, Any], expected: str) -> None:
    app.config["SERVER_NAME"] = "example.com"
    app.add_url_rule("/testing/<int:id>", "testing", lambda id: id)

    with app.test_request_context(request_url):
        parameters.setdefault("id", 1)
        assert rewrite_update(request, "testing", **parameters) == expected
