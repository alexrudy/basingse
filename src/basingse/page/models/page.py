import json

from basingse.models import Model
from flask import url_for
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from .blocks import Block
from .blocks import BlockContent


class Page(Model):
    title: Mapped[str] = mapped_column(String(), nullable=False, doc="Title of the page")
    slug: Mapped[str] = mapped_column(String(), nullable=False, doc="Slug of the page")
    contents: Mapped[str] = mapped_column(Text(), nullable=False, doc="Contents of the page from editor.js")

    @property
    def url(self) -> str:
        """URL for this page"""
        return url_for("page.view", slug=self.slug)

    @property
    def blocks(self) -> BlockContent:
        """List of block types in the page"""
        data = json.loads(self.contents)
        blocks = [Block.deserialize(block) for block in data["blocks"]]
        return BlockContent(blocks=blocks, version=data["version"], time=data["time"])
