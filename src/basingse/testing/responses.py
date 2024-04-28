import dataclasses as dc
from urllib.parse import urlsplit as url_parse

from werkzeug import Response as TestResponse


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
