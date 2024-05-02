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
        url="/<key>/delete-attachment/<uuid:attachment>/",
        methods=["GET", "DELETE"],
        attachments=True,
    )
    def delete_attachment(self, *, attachment: UUID, **kwargs: Any) -> IntoResponse:

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
        return render_template(["admin/{self.name}/edit.html", "admin/portal/edit.html"], form=form, **{self.name: obj})
