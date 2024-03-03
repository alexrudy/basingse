from typing import Any
from urllib.parse import parse_qs
from urllib.parse import urlsplit as url_parse

import pytest
from flask import Flask
from itsdangerous import BadSignature

from basingse.auth import utils
from basingse.auth.testing import Redirect


@pytest.mark.parametrize(
    "url, parameters, expected",
    [
        ("http://example.com", {"foo": "bar"}, "http://example.com?foo=bar"),
        ("http://example.com?foo=bar", {"foo": "baz"}, "http://example.com?foo=baz"),
        ("http://example.com?foo=bar", {"foo": "baz", "bar": "baz"}, "http://example.com?foo=baz&bar=baz"),
        ("http://example.com", {"_anchor": "foo"}, "http://example.com#foo"),
    ],
    ids=["url", "replace", "add", "anchor"],
)
def test_add_parameter_to_url(url: str, parameters: dict[str, str], expected: str) -> None:
    assert utils.url_with(url, **parameters) == expected


def test_add_parameter_to_url_external(app: Flask) -> None:
    with app.app_context():
        assert utils.url_with("/admin/", _external=True, _scheme="http") == "http://basingse.test/admin/"


@pytest.mark.parametrize(
    "url, next, location, code",
    [
        ("http://basingse.test", None, "http://basingse.test", 302),
        ("/", "/admin/", "/?next=Ii9hZG1pbi8i.pciz_82d2nWBdEOFFMwHrg1H3ok", 302),
        ("home", None, "/", 302),
    ],
    ids=["external", "next", "view"],
)
def test_wrap_redirect(app: Flask, url: str, next: str | None, location: str, code: int) -> None:
    def redirect_inner(location: str, code: int = 302, **kwargs: Any) -> tuple[str, int]:
        return (location, code)

    redirect = utils.wrap_redirect(redirect_inner)

    query = {}
    if next:
        with app.app_context():
            query["next"] = utils.serializer().dumps(next)

    with app.test_request_context(url, query_string=query):
        assert redirect(url) == (location, code)


@pytest.mark.parametrize(
    "next, kwargs, expected",
    [
        (None, {}, "/"),
        (None, {"default": "home"}, "/"),
        (None, {"default": "/a/"}, "/a/"),
        (None, {"default": "home", "foo": "bar"}, "/"),
        ("/admin/", {}, "/admin/"),
        ("http://example.com/", {}, "/"),
    ],
    ids=["default", "default_home", "default_absolute", "default_parameters", "next", "next_external"],
)
def test_redirect_next(app: Flask, next: str | None, kwargs: dict[str, Any], expected: str) -> None:
    query = {}

    if next is not None:
        with app.app_context():
            query["next"] = utils.serializer().dumps(next)

    with app.test_request_context("/", query_string=query):
        assert utils.redirect_next(**kwargs) == Redirect(expected)


@pytest.mark.parametrize(
    "endpoint, kwargs, expected",
    [
        ("auth.login", {"next": "/"}, "/auth/login/?next=Ii8i.y40kSL_yxBf26FHWxsMMeYjYzf4"),
        ("auth.login", {}, "/auth/login/?next=Ii8_Ig.VQPHBpOwjGVq9kzUTt4R_0AYzWQ"),
        ("auth.login", {"next": "home"}, "/auth/login/?next=ImhvbWUi.L4YBtc1AxyPYsrXzgjJTIPMLxSI"),
        (
            "auth.login",
            {"next": "home", "foo": "bar"},
            "/auth/login/?foo=bar&next=ImhvbWUi.L4YBtc1AxyPYsrXzgjJTIPMLxSI",
        ),
        (
            "auth.login",
            {"next": "Ii8i.y40kSL_yxBf26FHWxsMMeYjYzf4"},
            "/auth/login/?next=Ii8i.y40kSL_yxBf26FHWxsMMeYjYzf4",
        ),
    ],
    ids=["bare_url", "no_parameters", "next", "next_parameters", "next_token"],
)
def test_url_for_next(app: Flask, endpoint: str, kwargs: dict[str, Any], expected: str) -> None:
    with app.test_request_context("/"):
        url = utils.url_for_next(endpoint, **kwargs)
        assert url == expected

        token = parse_qs(url_parse(url).query)["next"][0]

        expected_next = kwargs.get("next", "/?")
        try:
            utils.serializer().loads(expected_next)
        except BadSignature:
            assert utils.serializer().loads(token) == expected_next
        else:
            assert token == expected_next
