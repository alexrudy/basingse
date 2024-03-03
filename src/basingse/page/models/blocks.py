import dataclasses as dc
from typing import ClassVar
from typing import Protocol
from typing import Type
from typing import TypeVar

import marshmallow_dataclass
from jinja2 import Template
from marshmallow.schema import Schema


class BlockKind(Protocol):
    __kind__: ClassVar[str]

    def render(self) -> str | Template: ...


B = TypeVar("B", bound=BlockKind)


@dc.dataclass
class Block:
    id: str
    type: str
    data: BlockKind

    __registry__: ClassVar[dict[str, Type[Schema]]] = {}

    @classmethod
    def deserialize(cls, data: dict) -> "Block":
        schema = cls.__registry__[data["type"]]()
        content = schema.load(data["data"])
        return cls(data["id"], data["type"], content)

    def render(self) -> str | Template:
        return self.data.render()


def block(datatype: type[B]) -> type[B]:
    cls = dc.dataclass(datatype)
    Block.__registry__[datatype.__kind__] = marshmallow_dataclass.class_schema(cls)
    return cls


@block
class Header:
    text: str
    level: int
    __kind__: ClassVar[str] = "header"

    def render(self) -> str:
        return "blocks/header.html"


@block
class Paragraph:
    text: str
    __kind__: ClassVar[str] = "paragraph"

    def render(self) -> str:
        return "blocks/paragraph.html"


@dc.dataclass
class BlockContent:
    blocks: list[Block]
    version: str
    time: int
