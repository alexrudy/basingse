import datetime as dt
import io
from pathlib import Path
from uuid import UUID

import pytest
import structlog
from bootlace.table import Column
from bootlace.table import Table
from flask import Flask
from flask_attachments import Attachment
from flask_attachments import CompressionAlgorithm
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
from basingse.testing.responses import Ok
from basingse.testing.responses import Redirect

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
        assert response == Ok()


class TestAttachmentAdmin:

    @pytest.fixture
    def attachment(self, app: Flask) -> Attachment:
        with app.app_context():
            session = svcs.get(Session)
            attachment = Attachment.from_file(Path("tests/data/attachment.txt"))
            session.add(attachment)
            session.commit()
            session.refresh(attachment)
            make_transient(attachment)
        return attachment

    def test_new_attachment(self, app: Flask) -> None:
        with app.test_client() as client:
            response = client.get("/admin/attachment/new/")
            assert response == Ok()

    def test_list_redirect(self, app: Flask) -> None:
        with app.test_client() as client:
            response = client.get("/admin/attachment/")
            assert response == Redirect("/admin/attachment/list/")

    def test_list_attachments(self, app: Flask) -> None:
        with app.test_client() as client:
            response = client.get("/admin/attachment/list/")
            assert response == Ok()

    def test_create_attachment(self, app: Flask) -> None:
        with app.test_client() as client:
            response = client.post(
                "/admin/attachment/new/",
                data={
                    "filename": "example.txt",
                    "content_type": "text/plain",
                    "compression": "NONE",
                    "digest_algorithm": "sha256",
                    "attachment": (io.BytesIO(b"Hello, World!"), "example.txt"),
                },
            )
            assert response == Redirect("/admin/attachment/list/")

    def test_create_no_file(self, app: Flask) -> None:
        with app.test_client() as client:
            response = client.post("/admin/attachment/new/", data={"filename": "example.txt"})
            assert response == Ok()

    def test_edit_attachment_invalid(self, app: Flask, attachment: Attachment) -> None:
        with app.test_client() as client:
            response = client.post(
                f"/admin/attachment/{attachment.id}/edit/", data={"content_type": "some/invalid/mime"}
            )
            assert response == Ok()

    def test_edit_attachment(self, app: Flask, attachment: Attachment) -> None:
        with app.test_client() as client:
            response = client.post(f"/admin/attachment/{attachment.id}/edit/", data={"filename": "example.txt"})
            assert response == Redirect("/admin/attachment/list/")

        with app.app_context():
            session = svcs.get(Session)
            altered = session.get(Attachment, attachment.id)
            assert altered is not None
            assert altered.filename == "example.txt"

    def test_edit_attachment_get(self, app: Flask, attachment: Attachment) -> None:
        with app.test_client() as client:
            response = client.get(f"/admin/attachment/{attachment.id}/edit/")
            assert response == Ok()

    def test_edit_attachment_immutable_fields(self, app: Flask, attachment: Attachment) -> None:
        with app.test_client() as client:
            response = client.post(
                f"/admin/attachment/{attachment.id}/edit/",
                data={"filename": "example.txt", "compression": "GZIP", "digest_algorithm": "sha1", "digest": "1234"},
            )
            assert response == Ok()

        with app.app_context():
            session = svcs.get(Session)
            altered = session.get(Attachment, attachment.id)
            assert altered is not None
            assert altered.filename != "example.txt"
            assert altered.compression != CompressionAlgorithm.GZIP
            assert altered.digest_algorithm != "sha1"
