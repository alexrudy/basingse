import dataclasses as dc
from collections.abc import Callable
from typing import Any
from typing import ClassVar
from typing import TypeVar

V = TypeVar("V", bound="Visitor")

VisitImpl = Callable[[V, Any], Any]


class VisitorMeta(type):

    def __new__(mcls, name: str, bases: tuple[type, ...], dct: dict[str, Any]) -> type:
        registry = {}
        for impl in dct.values():
            if (visitor_meta := getattr(impl, "__visitor_meta__", None)) is not None:
                for target in visitor_meta.targets:
                    registry[target] = impl

        dct["_registry"] = registry

        return super().__new__(mcls, name, bases, dct)


class Visitor(metaclass=VisitorMeta):

    _registry: ClassVar[dict[type, VisitImpl]] = {}

    @classmethod
    def register(cls, target: type, impl: VisitImpl) -> None:
        """Register a visitor for a given type"""
        cls._registry[target] = impl

    def get_visitor_for_cls(self, target: type) -> None | Any:
        """Walk our own MRO, looking for the most recently defined visitor for this
        type heirarchy"""

        try:
            self._registry[target]
        except KeyError:
            pass

        for cls in type(self).mro():
            try:
                return getattr(cls, "_registry", {})[target]
            except KeyError:
                pass
        return None

    def visit(self, item: Any) -> Any:
        """"""

        if isinstance(item, type):
            mro = item.mro()
        else:
            mro = type(item).mro()

        for subcls in mro:
            if (visitor_impl := self.get_visitor_for_cls(subcls)) is not None:
                return visitor_impl(self, item)

        raise ValueError(f"No visitor is available for {mro[0]!r}")


@dc.dataclass
class VisitorMetaData:
    targets: list[type] = dc.field(default_factory=list)


def register(target: type) -> Callable[[VisitImpl], VisitImpl]:

    def _add_metadata(func: VisitImpl) -> VisitImpl:
        if (meta := getattr(func, "__visitor_meta__", None)) is not None:
            meta.targets.append(target)
        else:
            func.__visitor_meta__ = VisitorMetaData(targets=[target])  # type: ignore
        return func

    return _add_metadata
