from typing import Any
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


class AttachmentAdmin(AdminView[M]):
    """Admin base-class which supports managing attachments."""

    #: The template to use for attachments
    attachments: ClassVar[str | None] = None

    @action(
        permission="edit",
        url="/<key>/attachment/",
        methods=["GET"],
        attachments=True,
    )
    def attachment_field(self, field: str, **kwargs: Any) -> IntoResponse:
        field_id = field
        obj = self.single(**kwargs)
        form = type(self).form(obj=obj)
        return self.render_attachment_field(form, field_id, **{self.name: obj}, **kwargs)

    def render_attachment_field(self, form: Form, field: str, **kwargs: Any) -> IntoResponse:
        field_id = field
        field = next(field for field in form if field.id == field_id)
        if field is None:
            return "", 404
        return render_template(
            ["admin/{self.name}/_attachment_field.html", "admin/attachment/_field.html"],
            form=form,
            field=field,
            **kwargs,
        )

    @action(
        permission="edit",
        url="/<key>/delete-attachment/<uuid:attachment>/",
        methods=["GET", "DELETE"],
        attachments=True,
    )
    def delete_attachment(self, *, attachment: UUID, **kwargs: Any) -> IntoResponse:
        kwargs.pop("next", ".list")

        if not hasattr(self.model, "partial"):
            # Pre-emptive, partial is not an argument to .single()
            kwargs.pop("partial", None)

        session = svcs.get(Session)
        obj = self.single(**kwargs)
        attachment = session.scalar(select(Attachment).where(Attachment.id == attachment))
        if attachment is not None:
            session.delete(attachment)
            session.commit()
            session.refresh(obj)
        if request.method == "DELETE":
            return "", 204
        form = type(self).form(obj=obj)

        if "HX-Request" in request.headers and "field" in request.args:
            return self.render_attachment_field(form, request.args["field"], **{self.name: obj}, **kwargs)

        return render_template(["admin/{self.name}/edit.html", "admin/portal/edit.html"], form=form, **{self.name: obj})
