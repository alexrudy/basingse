import hashlib
from typing import Any
from typing import cast

import structlog
from bootlace.forms.fields import EnumField
from bootlace.forms.fields import KnownMIMEType
from flask_attachments import Attachment
from flask_attachments import CompressionAlgorithm
from flask_wtf.file import FileField
from flask_wtf.form import FlaskForm
from werkzeug.datastructures import FileStorage
from wtforms import Field
from wtforms import HiddenField
from wtforms import SelectField
from wtforms import StringField
from wtforms import SubmitField
from wtforms.validators import Optional
from wtforms.validators import UUID
from wtforms.validators import ValidationError

log = structlog.get_logger(__name__)


class AttachmentField(FileField):
    def process_formdata(self, valuelist: Any) -> None:
        super().process_formdata(valuelist)
        data = cast(FileStorage | Attachment | None, self.data)  # type: ignore[has-type]
        if data is None:
            self.data = None
        if isinstance(data, Attachment):
            self.data = data
        elif isinstance(data, FileStorage):
            attachment = Attachment()
            attachment.receive(data)
            self.data = attachment

    def populate_obj(self, obj: Any, name: str) -> None:
        """Make object population non-destructive"""
        if self.data is not None:
            setattr(obj, name, self.data)


class Unchanged:

    def __call__(self, form: FlaskForm, field: Field) -> Any:
        try:
            id = form.id.data
        except AttributeError:
            id = None

        if id is None:
            # We're creating a new attachment, so no need to check for changes
            return

        if field.data is None:
            return

        if field.object_data is not None and field.data != field.object_data:
            log.debug("Field changed", field=field.name, data=field.data, object_data=field.object_data)
            raise ValidationError(f"Can't change {field.name} of an existing file.")


class FileOrExistingAttachment:

    def __call__(self, form: FlaskForm, field: Field) -> Any:
        try:
            id = form.id.data
        except AttributeError:
            id = None

        if field.data is None and id is None:
            raise ValidationError("A file is required when creating a new attachment.")
        if field.data is not None and not isinstance(field.data, FileStorage):
            raise ValidationError("Invalid file data.")


class AttachmentForm(FlaskForm):
    id = HiddenField("ID", validators=[Optional(), UUID()])

    filename = StringField("Filename")
    content_type = StringField("Content Type", validators=[Optional(), KnownMIMEType()])
    compression = EnumField(
        label="Compression Algorithm",
        enum=CompressionAlgorithm,
        labelfunc=lambda value: value.name,
        validators=[Unchanged()],
    )
    digest = StringField("Digest", validators=[Unchanged()])
    digest_algorithm = SelectField(
        label="Digest Algorithm", choices=sorted(hashlib.algorithms_available), validators=[Unchanged()]
    )

    attachment = FileField("Attachment", validators=[FileOrExistingAttachment()])
    submit = SubmitField(label="Save")

    def filter_contents(self, data: Any) -> FileStorage | None:
        if not isinstance(data, FileStorage):
            log.debug("Discarding non-Filestoage data", type=type(data))
            return None
        return data

    def populate_obj(self, obj: Attachment) -> None:
        super().populate_obj(obj)
        if self.attachment.data:
            obj.receive(self.attachment.data)
