from typing import Any
from uuid import UUID

from basingse.models import Model
from flask import url_for
from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from .blocks import Block
from .blocks import Container


class Page(Model):
    title: Mapped[str] = mapped_column(String(), nullable=False, doc="Title of the page")
    slug: Mapped[str] = mapped_column(String(), nullable=False, doc="Slug of the page")
    root_id: Mapped[UUID] = mapped_column(
        Uuid(), ForeignKey("blocks.id", ondelete="CASCADE"), nullable=True, doc="Root block of the page"
    )
    root = relationship(Block, cascade="all, delete-orphan", single_parent=True, uselist=False)

    def __init__(self, **kw: Any):
        super().__init__(**kw)
        if self.root is None and self.root_id is None:
            self.root = Container(order=0)

    @property
    def url(self) -> str:
        """URL for this page"""
        return url_for("page.view", slug=self.slug)
