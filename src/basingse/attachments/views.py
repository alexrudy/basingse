from typing import Any

import structlog
from bootlace.table import Column
from bootlace.table import Table
from bootlace.table.columns import EditColumn
from flask_attachments import Attachment
from flask_attachments.extension import settings
from sqlalchemy.orm import Session

from .forms import AttachmentForm
from basingse import svcs
from basingse.admin.extension import AdminView
from basingse.admin.extension import PortalMenuItem
from basingse.admin.views import portal

log = structlog.get_logger(__name__)


class AttachmentTable(Table):

    filename = EditColumn("Filename", attribute="filename")
    compression = Column("Compression", attribute="compression")
    size = Column("Size", attribute="size")
    mime = Column("MIME Type", attribute="mime")


class AttachmentsAdmin(AdminView, blueprint=portal):
    url = "attachment"
    key = "<uuid:id>"
    name = "attachment"
    form = AttachmentForm
    model = Attachment
    table = AttachmentTable
    nav = PortalMenuItem("Attachments", "admin.attachment.list", "file-earmark", "attachment.view")

    def blank(self, **kwargs: Any) -> Any:
        obj = super().blank(**kwargs)
        obj.compression = settings.compression()
        obj.digest_algorithm = settings.digest()
        return obj

    def process(self, form: AttachmentForm, obj: Attachment) -> bool:

        if form.attachment.data:
            form.populate_obj(obj=obj)
            log.info("Adding file to attachment", obj=obj)
            obj.receive(form.attachment.data)

        else:
            if obj.id is None:
                form.attachment.errors.append("A file is required.")

            log.info("Updating an existing file", obj=obj)

            # Process existing file
            if form.compression.data != obj.compression:
                form.compression.errors.append("Can't change compression of an existing file.")
                form.compression.data = obj.compression
            if form.digest_algorithm.data != obj.digest_algorithm:
                form.digest_algorithm.errors.append("Can't change digest algorithm of an existing file.")
                form.digest_algorithm.data = obj.digest_algorithm
            if form.digest.data != obj.digest:
                form.digest.errors.append("Can't change existing file digest.")
                form.digest.data = obj.digest

        if form.errors or (not form.validate()):
            log.error("Form validation failed", obj=obj, errors=form.errors, debug=True)
            # Check here to see if we have any errors from the steps above
            return False

        if not form.attachment.data:
            form.populate_obj(obj=obj)

        session = svcs.get(Session)
        session.add(obj)
        session.commit()
        return True
