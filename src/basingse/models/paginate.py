from typing import Generic
from typing import TypeVar

import attrs
from bootlace.endpoint import Endpoint
from flask import request
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from sqlalchemy.sql import select
from sqlalchemy.sql.selectable import Select
from werkzeug.utils import cached_property

from basingse import svcs

T = TypeVar("T")


@attrs.define
class Paginate(Generic[T]):
    query: Select[tuple[T]]
    per_page: int
    page: int
    endpoint: Endpoint
    namespace: str = ""

    @classmethod
    def from_request(
        cls, query: Select[tuple[T]], endpoint: Endpoint, per_page: int = 20, namespace: str = ""
    ) -> "Paginate":
        if f"{namespace}per-page" in request.args:
            per_page = int(request.args[f"{namespace}per-page"])
        if f"{namespace}page" in request.args:
            page = int(request.args[f"{namespace}page"])
        else:
            page = 1

        return cls(query, per_page=per_page, page=page, endpoint=endpoint)

    @property
    def entries(self):
        session = svcs.get(Session)
        entries = list(session.scalars(self.query.offset((self.page - 1) * self.per_page).limit(self.per_page)))
        print(entries)
        return entries

    @property
    def has_previous(self) -> bool:
        return self.page > 1

    @property
    def has_next(self) -> bool:
        return self.page < self.pages

    @property
    def previous(self) -> str:
        return self.endpoint(page=self.page - 1, per_page=self.per_page)

    @property
    def next(self) -> str:
        return self.endpoint(page=self.page + 1, per_page=self.per_page)

    @cached_property
    def count(self) -> int:
        session = svcs.get(Session)
        result = session.scalar(select(func.coalesce(func.count(), 0)).select_from(self.query))
        if result is None:
            raise ValueError(f"Counting query {self.query} returned NULL")
        return result

    @property
    def pages(self) -> int:
        return max(0, self.count - 1) // self.per_page + 1
