import hashlib
from typing import Any

import structlog
from bootlace.table import Column
from bootlace.table import Table
from bootlace.table.columns import EditColumn
from flask_attachments import Attachment
from flask_attachments import CompressionAlgorithm
from flask_attachments.extension import settings
from marshmallow import fields
from marshmallow import validates
from marshmallow import ValidationError
from wtforms import Form

from .forms import AttachmentForm
from basingse.admin.extension import AdminView
from basingse.admin.portal import PortalMenuItem
from basingse.admin.views import portal
from basingse.models.schema import Schema

log = structlog.get_logger(__name__)


class AttachmentSchema(Schema):
    id = fields.UUID()
    filename = fields.String(allow_none=True)
    compression = fields.String()
    size = fields.Integer(allow_none=True)
    mime = fields.String(allow_none=True)
    digest = fields.String()
    digest_algorithm = fields.String()

    @validates("compression")
    def validate_compression(self, value: str) -> None:
        self._validate_unchanged("compression", value)
        if value.upper() not in CompressionAlgorithm:
            raise ValidationError(f"Invalid compression algorithm: {value}")

    @validates("digest_algorithm")
    def validate_digest_algorithm(self, value: str) -> None:
        self._validate_unchanged("digest_algorithm", value)
        try:
            hashlib.new(value)
        except ValueError:
            raise ValidationError(f"Invalid digest algorithm: {value}") from None

    @validates("digest")
    def validate_digest(self, value: str) -> None:
        self._validate_unchanged("digest", value)

    def _validate_unchanged(self, field: str, value: Any) -> None:
        current = getattr(self._orm_instance, field)
        if current is None:
            return
        if value != current:
            raise ValidationError(f"Can't change {field} of an existing file.", field_name=field)

    class Meta:
        model = Attachment


class AttachmentTable(Table):

    filename = EditColumn("Filename", attribute="filename")
    compression = Column("Compression", attribute="compression")
    size = Column("Size", attribute="size")
    mime = Column("MIME Type", attribute="mime")


class AttachmentsAdmin(AdminView, blueprint=portal):
    url = "attachment"
    key = "<uuid:id>"
    name = "attachment"
    model = Attachment
    nav = PortalMenuItem("Attachments", "admin.attachment.list", "file-earmark", "attachment.view")

    @classmethod
    def schema(cls, **options: Any) -> Schema:
        return AttachmentSchema(**options)

    @classmethod
    def table(cls) -> Table:
        return AttachmentTable()

    @classmethod
    def form(cls, obj: Attachment | None = None, **options: Any) -> Form:
        return AttachmentForm(obj=obj, **options)

    def blank(self, **kwargs: Any) -> Any:
        obj = super().blank(**kwargs)
        obj.compression = settings.compression()
        obj.digest_algorithm = settings.digest()
        return obj
