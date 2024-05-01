from bootlace.forms.fields import SLUG_VALIDATOR
from bootlace.table.columns import Column
from bootlace.table.columns import EditColumn
from flask import url_for
from marshmallow import fields
from sqlalchemy import String
from sqlalchemy import Text
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from wtforms.validators import DataRequired

from ..forms import EditorField
from .blocks import BlockContent
from basingse.models import Model
from basingse.models import orm


class Page(Model):
    title: Mapped[str] = mapped_column(
        String(),
        nullable=False,
        doc="Title of the page",
        info=orm.info(
            form=orm.FormInfo(label="Title", validators=[DataRequired()]),
            schema=orm.auto(),
            listview=EditColumn("Page"),
        ),
    )
    slug: Mapped[str] = mapped_column(
        String(),
        nullable=False,
        doc="Slug of the page",
        info=orm.info(
            form=orm.FormInfo(label="Slug", validators=[DataRequired(), SLUG_VALIDATOR]),
            schema=orm.auto(),
            listview=Column("Slug"),
        ),
    )
    contents: Mapped[str] = mapped_column(
        Text(),
        nullable=False,
        doc="Contents of the page from editor.js",
        info=orm.info(
            form=EditorField("Content", validators=[DataRequired()]),
            schema=fields.Nested(BlockContent.Schema),
        ),
    )

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
