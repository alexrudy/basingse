from typing import Any
from uuid import UUID

import pytest
import structlog
from bootlace.table import Column
from flask import Flask
from flask import jsonify
from flask import request
from flask.typing import ResponseValue
from marshmallow import validate
from sqlalchemy.orm import make_transient
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import Session
from wtforms.validators import Length

from basingse import svcs
from basingse.admin.extension import action
from basingse.admin.extension import AdminView
from basingse.admin.portal import Portal
from basingse.models import Model
from basingse.models import orm

logger = structlog.get_logger()


class FakePost(Model):

    title: Mapped[str] = mapped_column(
        default="",
        nullable=False,
        info=orm.info(
            schema=orm.SchemaInfo(validate=[validate.Length(min=1)]),
            form=orm.FormInfo(validators=[Length(min=1)]),
            listview=Column("Title"),
        ),
    )
    content: Mapped[str] = mapped_column(
        default="", info=orm.info(schema=orm.auto(), form=orm.auto(), listview=Column("Content"))
    )


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

        @action(permission="delete", methods=["GET", "DELETE"], url="/destructive/")
        def destructive(self, **kwargs: Any) -> ResponseValue:
            return jsonify(action="destructive", view_args=kwargs, args=request.args)

        @action(permission="view", methods=["GET"], url="/partial/")
        def partial(self, **kwargs: Any) -> ResponseValue:
            return jsonify(action="partial", view_args=kwargs, args=request.args)

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
