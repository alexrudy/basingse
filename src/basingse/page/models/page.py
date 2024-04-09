from flask import url_for
from marshmallow import fields
from marshmallow import Schema as BaseSchema
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from .blocks import BlockContent
from basingse.models import Model


class Page(Model):
    title: Mapped[str] = mapped_column(String(), nullable=False, doc="Title of the page")
    slug: Mapped[str] = mapped_column(String(), nullable=False, doc="Slug of the page")
    contents: Mapped[str] = mapped_column(Text(), nullable=False, doc="Contents of the page from editor.js")

    @property
    def url(self) -> str:
        """URL for this page"""
        return url_for("page.page", slug=self.slug)

    @property
    def blocks(self) -> BlockContent:
        """List of block types in the page"""
        schema = BlockContent.Schema()
        return schema.loads(self.contents)

    @blocks.setter
    def blocks(self, value: BlockContent) -> None:
        """Set blocks from schema"""
        schema = BlockContent.Schema()
        self.contents = schema.dumps(value)

    class Schema(BaseSchema):
        title = fields.Str(required=True)
        slug = fields.Str(required=True)
        blocks = fields.Nested(BlockContent.Schema)
