import dataclasses as dc


@dc.dataclass
class Item:
    name: str
    endpoint: str
    icon: str | None = None
    capability: str | None = None


@dc.dataclass
class Nav:
    items: list[Item]
