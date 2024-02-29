import uuid
from typing import Any
from uuid import UUID

from basingse.models import Model
from basingse.models import tablename
from jinja2 import Template
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy import Uuid
from sqlalchemy.orm import declared_attr
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy.orm import validates


class Block(Model):

    @declared_attr.directive
    def __tablename__(cls) -> str:  # noqa: B902
        name = tablename(cls.__name__)
        if "block" not in name:
            return f"block_{name}"
        return name

    id: Mapped[UUID] = mapped_column(Uuid(), primary_key=True, default=uuid.uuid4)

    kind = mapped_column(String(), nullable=False, doc="Kind of block")
    order: Mapped[int] = mapped_column(
        Integer(), nullable=False, default=0, doc="Order of the block in the parent blocks"
    )
    parent_id = mapped_column(Uuid(), ForeignKey("block_containers.id"), nullable=True, doc="Parent block")

    @declared_attr
    def parent(cls) -> Mapped["Container"]:
        return relationship(
            "Container",
            foreign_keys=[cls.parent_id],
            cascade="all",
            back_populates="children",
        )

    @declared_attr.directive
    def __mapper_args__(cls) -> dict[str, Any]:  # noqa: B902
        if cls.__name__ == "Block":
            return {"polymorphic_on": cls.kind, "polymorphic_identity": "block"}
        return {"polymorphic_identity": cls.__name__.lower()}

    def __repr__(self) -> str:
        return f"<{self.__class__.__name__} {self.kind}: {self.id}>"

    def render(self) -> Template | str:
        raise NotImplementedError("Block subclasses must implement render")


class Container(Block):
    id: Mapped[UUID] = mapped_column(Uuid(), ForeignKey("blocks.id"), primary_key=True, default=uuid.uuid4)

    children = relationship(
        "Block",
        back_populates="parent",
        order_by="Block.order",
        cascade="all",
        remote_side="Block.parent_id",
        foreign_keys=[Block.parent_id],
    )

    @declared_attr.directive
    def __mapper_args__(cls) -> dict[str, Any]:  # noqa: B902
        return {"polymorphic_identity": "container", "inherit_condition": cls.id == Block.id}

    @validates("children")
    def validate_children(self, key: str, child: Block) -> Block:
        if child.parent is not None:
            raise ValueError("Block already has a parent")
        child.order = len(self.children)
        return child

    def render(self) -> str:
        return "blocks/container.html"


class Markdown(Block):
    id: Mapped[UUID] = mapped_column(Uuid(), ForeignKey("blocks.id"), primary_key=True, default=uuid.uuid4)

    content: Mapped[str] = mapped_column(Text(), nullable=False, doc="Markdown content")

    def render(self) -> str:
        return "blocks/markdown.html"
