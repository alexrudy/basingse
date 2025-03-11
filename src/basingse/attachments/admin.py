from typing import Any
from typing import cast
from typing import ClassVar
from typing import TypeVar
from uuid import UUID

from flask import render_template
from flask import request
from flask.typing import ResponseReturnValue as IntoResponse
from flask_attachments import Attachment
from sqlalchemy import select
from sqlalchemy.orm import Session
from wtforms.form import Form

from basingse import svcs
from basingse.admin.extension import action
from basingse.admin.extension import AdminView
from basingse.models import Model

M = TypeVar("M", bound=Model)
I = TypeVar("I", bound=Model)  # noqa: E741


class AttachmentAdmin(AdminView[M, I]):
    """Admin base-class which supports managing attachments related
    to the target model."""

    #: The template to use for attachments
    attachments: ClassVar[str | None] = None

    @action(
        permission="edit",
        url="/<key>/attachment/",
        methods=["GET"],
        attachments=True,
    )
    def attachment_field(self, id: I, field: str) -> IntoResponse:
        field_id = field
        obj = self.single(id=id)
        form = type(self).form(obj=obj)
        return self.render_attachment_field(form, field_id, context={self.name: obj})

    def render_attachment_field(self, form: Form, field_id: str, context: dict[str, Any] | None = None) -> IntoResponse:
        field = next(field for field in form if field.id == field_id)
        if field is None:
            return "", 404

        if context is None:
            context = {}
        context["form"] = form
        context["field"] = field

        return render_template(
            [
                "admin/{self.name}/_attachment_field.html",
                "admin/attachment/_field.html",
            ],
            **context,
        )

    @action(
        permission="edit",
        url="/<key>/delete-attachment/<uuid:attachment_id>/",
        methods=["GET", "DELETE"],
        attachments=True,
    )
    def delete_attachment(self, *, id: I, attachment_id: UUID) -> IntoResponse:
        session = svcs.get(Session)
        obj = self.single(id=id)
        attachment = session.scalar(select(Attachment).where(Attachment.id == attachment_id))
        if attachment is not None:
            session.delete(attachment)
            session.commit()
            session.refresh(obj)
        if request.method == "DELETE":
            return "", 204
        form = type(self).form(obj=obj)

        if "HX-Request" in request.headers and "field" in request.args:
            return self.render_attachment_field(form, request.args["field"], **cast(dict[str, Any], {self.name: obj}))

        return self.render("edit", item=obj, context={"form": form})
