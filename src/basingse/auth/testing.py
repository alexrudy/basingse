import dataclasses as dc
from typing import Any
from urllib.parse import urlsplit as url_parse

from flask import url_for
from flask.testing import FlaskClient
from werkzeug import Response as TestResponse


class LoginClient(FlaskClient):
    blueprint: str = "auth"

    def login(self, email: str | None, password: str | None, **parameters: Any) -> TestResponse:
        with self.application.app_context():
            url = url_for(f"{self.blueprint}.login")
        response = self.post(url, data={"email": email, "password": password}, **parameters)
        assert response.status_code == 302
        return response

    def login_session(self, email: str, **parameters: Any) -> TestResponse:
        with self.application.app_context():
            url = url_for(f"{self.blueprint}.dev_login")

        response = self.post(url, json={"email": email}, **parameters)
        assert response.status_code == 204
        return response

    def logout(self) -> TestResponse:
        with self.application.app_context():
            url = url_for(f"{self.blueprint}.logout")

        response = self.get(url)
        assert response.status_code == 302
        return response


class Response:
    pass


@dc.dataclass
class Redirect(Response):
    url: str
    status: int = 302

    def __eq__(self, other: object) -> bool:  # pragma: nocover
        if isinstance(other, Redirect):
            return self.url == other.url and self.status == other.status
        if isinstance(other, TestResponse):
            return self.status == other.status_code and self.url == url_parse(other.location).path
        return NotImplemented


@dc.dataclass
class Unauthorized(Response):
    status: int = 401

    def __eq__(self, other: object) -> bool:  # pragma: nocover
        if isinstance(other, Unauthorized):
            return self.status == other.status
        if isinstance(other, TestResponse):
            return self.status == other.status_code
        return NotImplemented


@dc.dataclass
class Ok(Response):
    status: int = 200

    def __eq__(self, other: object) -> bool:  # pragma: nocover
        if isinstance(other, Ok):
            return self.status == other.status
        if isinstance(other, TestResponse):
            return self.status == other.status_code
        return NotImplemented
