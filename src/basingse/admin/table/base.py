import inspect
from collections.abc import Callable
from collections.abc import Mapping
from typing import Any
from typing import ClassVar
from typing import TypeVar

import attrs
from jinja2 import Template


@attrs.define
class Heading:
    text: str
    icon: str | None = None

    def template(self) -> Template:
        if self.icon is None:
            return Template(source=self.text)
        return Template(
            source=f"""
<a href="#" data-bs-toggle="tooltip" data-bs-title="{self.text}" class="link-dark">
    [! icon('{self.icon}', height=12, width=12) !]
</a>
""".strip(),  # noqa: B907
            block_start_string="[%",
            block_end_string="%]",
            variable_end_string="!]",
            variable_start_string="[!",
        )


T = TypeVar("T")


def maybe(cls: type[T]) -> Callable[[str | T], T]:
    def converter(value: str | T) -> T:
        if isinstance(value, str):
            return cls(value)  # type: ignore
        return value

    return converter


@attrs.define
class ColumnBase:
    heading: Heading = attrs.field(converter=maybe(Heading))  # type: ignore
    attribute: str | None = None


def is_instance_or_subclass(val: Any, class_: type) -> bool:
    """Return True if ``val`` is either a subclass or instance of ``class_``."""
    try:
        return issubclass(val, class_)
    except TypeError:
        return isinstance(val, class_)


def _get_columns(attrs: Mapping[str, Any]) -> list[tuple[str, ColumnBase]]:
    return [
        (column_name, column_value)
        for column_name, column_value in attrs.items()
        if is_instance_or_subclass(column_value, ColumnBase)
    ]


class TableMetaclass(type):

    def __new__(mcls, name: str, bases: tuple[type, ...], namespace: dict[str, Any]) -> type:
        namespace["_declared_columns"] = _get_columns(namespace)
        return super().__new__(mcls, name, bases, namespace)

    @classmethod
    def get_declared_columns(mcls, cls: type) -> list[tuple[str, ColumnBase]]:
        mro = inspect.getmro(cls)
        # Loop over mro in reverse to maintain correct order of fields
        return sum(
            (
                _get_columns(
                    getattr(base, "_declared_columns", base.__dict__),
                )
                for base in mro[:0:-1]
            ),
            [],
        )


class Table(metaclass=TableMetaclass):

    _declared_columns: ClassVar[list[tuple[str, ColumnBase]]]

    @property
    def columns(self) -> list[tuple[str, ColumnBase]]:
        return self._declared_columns
