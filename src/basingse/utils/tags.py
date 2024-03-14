import collections
import dataclasses as dc
import functools
import itertools
from collections.abc import Iterator

from dominate import tags


def _monkey_patch_dominate() -> None:
    """Monkey patch the dominate tags to support class attribute manipulation"""
    tags.html_tag.classes = property(lambda self: Classes(self))


class Classes:
    def __init__(self, tag: tags.html_tag) -> None:
        self.tag = tag

    def __contains__(self, cls: str) -> bool:
        return cls in self.tag.attributes.get("class", "").split()

    def __iter__(self) -> Iterator[str]:
        return iter(self.tag.attributes.get("class", "").split())

    def add(self, *classes: str) -> None:
        add_cls(self.tag, *classes)

    def remove(self, *classes: str) -> None:
        remove_cls(self.tag, *classes)

    def swap(self, old: str, new: str) -> None:
        swap_cls(self.tag, old, new)


def add_cls(tag: tags.html_tag, *classes: str) -> tags.html_tag:
    current = tag.attributes.get("class", "").split()
    for cls in classes:
        if cls not in current:
            current.append(cls)
    tag.attributes["class"] = " ".join(current)
    return tag


def remove_cls(tag: tags.html_tag, *classes: str) -> tags.html_tag:
    current = tag.attributes.get("class", "").split()
    for cls in classes:
        if cls in current:
            current.remove(cls)
    tag.attributes["class"] = " ".join(current)
    return tag


def swap_cls(tag: tags.html_tag, old: str, new: str) -> tags.html_tag:
    current = tag.attributes.get("class", "").split()
    if old in current:
        current.remove(old)
    if new not in current:
        current.append(new)
    tag.attributes["class"] = " ".join(current)
    return tag


@dc.dataclass
class HtmlIDScope:
    scopes: collections.defaultdict[str, itertools.count] = dc.field(
        default_factory=lambda: collections.defaultdict(itertools.count)
    )

    def __call__(self, scope: str) -> str:
        counter = next(self.scopes[scope])
        if counter == 0:
            return scope
        return f"{scope}-{counter}"

    def factory(self, scope: str) -> functools.partial:
        return functools.partial(self, scope)


ids = HtmlIDScope()
_monkey_patch_dominate()
