import datetime as dt
from pathlib import Path
from uuid import UUID

import pytest
import structlog
from bootlace.table import Column
from bootlace.table import Table
from flask import Flask
from flask_attachments import Attachment
from flask_wtf.form import FlaskForm as Form
from marshmallow import fields
from marshmallow import Schema as BaseSchema
from sqlalchemy.orm import make_transient
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Session
from wtforms import fields as form_fields
from wtforms import validators

from basingse import svcs
from basingse.admin.extension import AdminView
from basingse.admin.extension import Portal
from basingse.attachments.admin import AttachmentAdmin
from basingse.attachments.forms import AttachmentField
from basingse.models import Model

logger = structlog.get_logger()


class FakeProfile(Model):

    title: Mapped[str] = mapped_column(default="")
    created: Mapped[dt.datetime] = mapped_column(default=lambda: dt.datetime.now(dt.UTC))
    attachment_id: Mapped[UUID] = mapped_column()
    attachment = relationship(Attachment, foreign_keys=[attachment_id], primaryjoin=Attachment.id == attachment_id)


class FakeProfileSchema(BaseSchema):

    id = fields.Integer(dump_only=True)
    title = fields.String(required=True)


class FakeProfileForm(Form):

    title = form_fields.StringField("Title", validators=[validators.DataRequired()])
    title = form_fields.StringField("Title", validators=[validators.DataRequired()])
    attachment = AttachmentField("Picture")


class FakeProfileTable(Table):

    title = Column("Title")
    content = Column("Content")


@pytest.fixture
def portal() -> Portal:
    portal = Portal("test_admin", __name__, url_prefix="/tests/admin/", template_folder="templates")
    return portal


@pytest.fixture
def adminview(portal: Portal, app: Flask) -> type[AdminView]:

    class FakeProfileAdmin(AttachmentAdmin, blueprint=portal):
        url = "profiles"
        key = "<uuid:id>"
        name = "profile"

        permission = "profile"

        model = FakeProfile
        form = FakeProfileForm
        schema = FakeProfileSchema
        table = FakeProfileTable

    app.register_blueprint(portal)
    return FakeProfileAdmin


@pytest.fixture
def profile(app: Flask) -> FakeProfile:
    with app.app_context():
        session = svcs.get(Session)
        profile = FakeProfile(title="Hello", attachment=Attachment.from_file(Path("tests/data/attachment.txt")))
        session.add(profile)
        session.commit()
        session.refresh(profile)
        make_transient(profile)
    return profile


@pytest.mark.usefixtures("adminview")
def test_delete_attachment(app: Flask, profile: FakeProfile) -> None:

    with app.test_client() as client:
        response = client.get(f"/tests/admin/profiles/{profile.id}/delete-attachment/{profile.attachment_id}/")
        assert response.status_code == 200
