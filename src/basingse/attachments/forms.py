import hashlib
from typing import Any
from typing import cast

import structlog
from basingse.forms import EnumField
from basingse.forms import Form as FlaskForm
from basingse.forms import KnownMIMEType
from flask_attachments import Attachment
from flask_attachments import CompressionAlgorithm
from flask_wtf.file import FileField
from werkzeug.datastructures import FileStorage
from wtforms import SelectField
from wtforms import StringField
from wtforms import SubmitField
from wtforms.validators import Optional

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


class AttachmentForm(FlaskForm):
    filename = StringField("Filename")
    content_type = StringField("Content Type", validators=[Optional(), KnownMIMEType()])
    compression = EnumField(
        label="Compression Algorithm", enum=CompressionAlgorithm, labelfunc=lambda value: value.name
    )
    digest = StringField("Digest")
    digest_algorithm = SelectField(label="Digest Algorithm", choices=sorted(hashlib.algorithms_available))

    attachment = FileField("Attachment")
    submit = SubmitField(label="Save")

    def filter_contents(self, data: Any) -> FileStorage | None:
        if not isinstance(data, FileStorage):
            log.debug("Discarding non-Filestoage data", type=type(data))
            return None
        return data
