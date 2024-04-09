import dataclasses as dc
from typing import Any

import pytest
import structlog
from bootlace.table import Column
from bootlace.table import Table
from flask import Blueprint
from flask_wtf.form import FlaskForm as Form
from marshmallow import fields
from marshmallow import Schema as BaseSchema
from wtforms import fields as form_fields
from wtforms import validators

from basingse.admin.extension import AdminView
from basingse.admin.extension import Portal


logger = structlog.get_logger()


@dc.dataclass
class FakePost:

    title: str = ""
    content: str = ""


@dc.dataclass
class FakePostDb:

    posts: dict[str, FakePost] = dc.field(default_factory=dict)


class FakePostSchema(BaseSchema):

    title = fields.String(required=True)
    content = fields.String(required=True)


class FakePostForm(Form):

    title = form_fields.StringField("Title", validators=[validators.DataRequired()])
    content = form_fields.TextAreaField("Content")


class FakePostTable(Table):

    title = Column("Title")
    content = Column("Content")


@pytest.fixture
def admin_blueprint() -> Blueprint:
    return Blueprint("test_admin", __name__, url_prefix="/tests/admin/", template_folder="templates")


@pytest.fixture
def portal(admin_blueprint: Blueprint) -> Portal:
    portal = Portal(admin_blueprint)
    return portal


@pytest.fixture
def db() -> FakePostDb:
    return FakePostDb()


@pytest.fixture
def adminview(portal: Portal, db: FakePostDb) -> type[AdminView]:

    class FakePostAdmin(AdminView, portal=portal):
        url = "posts"
        key = "<name>"
        name = "post"

        permission = "post"

        model = FakePost
        form = FakePostForm
        schema = FakePostSchema
        table = FakePostTable

        def query(self) -> list[FakePost]:
            return list(db.posts.values())

        def single(self, **kwargs: Any) -> FakePost:
            key = kwargs["name"]
            logger.debug("single", key=key)
            return db.posts[key]

        def process(self, form: FakePostForm, obj: FakePost) -> bool:
            form.populate_obj(obj)
            db.posts[obj.title] = obj
            logger.debug("process", obj=obj)
            return True

    return FakePostAdmin
