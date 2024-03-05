import dataclasses as dc
import datetime as dt
from collections.abc import Mapping
from typing import Any
from typing import ClassVar
from typing import Protocol
from typing import Type
from typing import TypeVar

import marshmallow_dataclass
from jinja2 import Template
from marshmallow import fields
from marshmallow import post_load
from marshmallow.exceptions import ValidationError
from marshmallow.schema import Schema as BaseSchema


class BlockData(Protocol):
    __kind__: ClassVar[str]

    def render(self) -> str | Template: ...


B = TypeVar("B", bound=BlockData)


class BlockDataField(fields.Field):

    __registry__: ClassVar[dict[str, Type[BaseSchema]]] = {}

    def _serialize(self, value: BlockData | None, attr: Any, obj: Any, **kwargs: Any) -> Any:
        if value is None:
            return None

        schema = self.__registry__[value.__kind__]()
        return schema.dump(value)

    def _deserialize(
        self, value: dict[str, Any] | None, attr: str | None, data: Mapping[str, Any] | None, **kwargs: Any
    ) -> BlockData | None:
        if value is None:
            return None

        if not data:
            messages = {"data": ["No data provided for block"]}
            raise ValidationError(messages, field_name="data", data=data)

        try:
            kind = data.pop("type")  # type: ignore
        except KeyError:
            messages = {"type": ["No type provided for block data"]}
            raise ValidationError(messages, field_name="data", data=data) from None

        try:
            schema = self.__registry__[kind]()
        except KeyError:
            messages = {"type": [f"Unknown block type {kind!r}"]}
            raise ValidationError(messages, field_name="data", data=data) from None

        return schema.load(value)


@dc.dataclass
class Block:
    data: BlockData
    id: str | None = None

    @property
    def type(self) -> str:
        return self.data.__kind__

    class Schema(BaseSchema):
        id = fields.String(dump_default=None, load_default=None)
        data = BlockDataField()
        type = fields.Function(lambda obj: obj.data.__kind__)

        @post_load
        def make_block(self, data: dict[str, Any], **kwargs: Any) -> "Block":
            return Block(**data)

    def render(self) -> str | Template:
        return self.data.render()


def block(datatype: type[B]) -> type[B]:
    cls = dc.dataclass(datatype)
    BlockDataField.__registry__[datatype.__kind__] = marshmallow_dataclass.class_schema(cls)
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
    version: str | None = None
    time: dt.datetime | None = None

    class Schema(BaseSchema):
        blocks = fields.Nested(Block.Schema, many=True)
        version = fields.String(dump_default=None, load_default=None)
        time = fields.DateTime(format="timestamp_ms", dump_default=None, load_default=None)

        @post_load
        def make(self, data: dict[str, Any], **kwargs: Any) -> "BlockContent":
            return BlockContent(**data)
