from typing import Any
from uuid import UUID

import pytest
import structlog
from bootlace.table import Column
from bootlace.table import Table
from flask import Flask
from flask import jsonify
from flask.typing import ResponseValue
from flask_wtf.form import FlaskForm as Form
from marshmallow import fields
from marshmallow import post_load
from marshmallow import Schema as BaseSchema
from sqlalchemy.orm import make_transient
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import Session
from wtforms import fields as form_fields
from wtforms import validators

from basingse import svcs
from basingse.admin.extension import action
from basingse.admin.extension import AdminView
from basingse.admin.extension import Portal
from basingse.models import Model

logger = structlog.get_logger()


class FakePost(Model):

    title: Mapped[str] = mapped_column(default="")
    content: Mapped[str] = mapped_column(default="")


class FakePostSchema(BaseSchema):

    id = fields.Integer(dump_only=True)
    title = fields.String(required=True)
    content = fields.String(required=True)

    @post_load
    def make_cls(self, data: dict[str, Any], **kwargs: Any) -> FakePost:
        return FakePost(**data)


class FakePostForm(Form):

    title = form_fields.StringField("Title", validators=[validators.DataRequired()])
    content = form_fields.TextAreaField("Content")


class FakePostTable(Table):

    title = Column("Title")
    content = Column("Content")


@pytest.fixture
def portal(app: Flask) -> Portal:
    portal = Portal("test_admin", __name__, url_prefix="/tests/admin/", template_folder="templates")

    svcs.register_value(app, Portal, portal)
    return portal


@pytest.fixture
def adminview(portal: Portal, app: Flask) -> type[AdminView]:

    class FakePostAdmin(AdminView, blueprint=portal):
        url = "posts"
        key = "<uuid:id>"
        name = "post"

        permission = "post"

        model = FakePost
        form = FakePostForm
        schema = FakePostSchema
        table = FakePostTable

        @action(permission="delete")
        def destructive(self, **kwargs: Any) -> ResponseValue:
            return jsonify(action="destructive", args=kwargs)

        @action(permission="view")
        def partial(self, **kwargs: Any) -> ResponseValue:
            return jsonify(action="partial", args=kwargs)

    app.register_blueprint(portal)
    return FakePostAdmin


@pytest.fixture
def post(app: Flask) -> FakePost:
    with app.app_context():
        session = svcs.get(Session)
        post = FakePost(id=UUID(int=1), title="Hello", content="World")
        session.add(post)
        session.commit()
        session.refresh(post)
        make_transient(post)
    return post
