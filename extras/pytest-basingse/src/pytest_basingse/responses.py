import dataclasses as dc
from typing import Any
from urllib.parse import urlsplit as url_parse

from werkzeug import Response as TestResponse


class Response:
    status: int

    def __eq__(self, other: object) -> bool:  # pragma: nocover
        if isinstance(other, Unauthorized):
            return self.status == other.status
        if isinstance(other, TestResponse):
            return self.status == other.status_code
        return NotImplemented


@dc.dataclass(eq=False)
class Redirect(Response):
    url: str
    status: int = 302

    def __eq__(self, other: object) -> bool:  # pragma: nocover
        if isinstance(other, Redirect):
            return self.url == other.url and self.status == other.status
        if isinstance(other, TestResponse):
            return self.status == other.status_code and self.url == url_parse(other.location).path
        return NotImplemented


@dc.dataclass(eq=False)
class Unauthorized(Response):
    status: int = 401


@dc.dataclass(eq=False)
class BadRequest(Response):
    status: int = 400


@dc.dataclass(eq=False)
class NotFound(Response):
    status: int = 404


@dc.dataclass(eq=False)
class Ok(Response):
    status: int = 200


def assertrepr_compare(config: Any, op: str, left: Any, right: Any) -> list[str] | None:  # pragma: nocover
    expected: Response | None = None
    assertee: TestResponse | None = None
    if isinstance(left, Response) and isinstance(right, TestResponse):
        expected = left
        assertee = right

    if isinstance(right, Response) and isinstance(left, TestResponse):
        expected = right
        assertee = left

    if expected is None or assertee is None:
        return None

    lines = []

    if op == "==":
        lines.append(f"Expected: {expected.status}, got: {assertee.status}")
    elif op == "!=":
        lines.append(f"Expected: {expected.status}, got: {assertee.status}")
    else:
        lines.append(f"Unsupported operator: {op}")

    lines.append(f"Expected: {expected!r}")
    lines.append(f"Got: {assertee.status_code} {assertee.status}")
    lines.extend(f"  {line}" for line in assertee.data.decode("utf-8").splitlines())

    return lines


def pytest_assertrepr_compare(config: Any, op: str, left: Any, right: Any) -> list[str] | None:
    return assertrepr_compare(config, op, left, right)
