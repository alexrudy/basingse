import enum
import mimetypes
from typing import Any
from typing import Generic
from typing import TypeVar

from flask_wtf import FlaskForm
from werkzeug.http import parse_options_header
from wtforms import fields
from wtforms.validators import Regexp
from wtforms.validators import ValidationError

SLUG_VALIDATOR = Regexp(r"^[A-Za-z0-9\-]+$", message="Slug must be a URL path component")


E = TypeVar("E", bound=enum.Enum)


def _enum_labelfunc(value: E) -> str:
    return value.name.capitalize().replace("_", "-")


class EnumField(fields.SelectField, Generic[E]):
    def __init__(self, label: str | None = None, validators: Any = None, *, enum: type[E], **kwargs: Any) -> None:
        labelfunc = kwargs.pop("labelfunc", _enum_labelfunc)
        kwargs.setdefault("choices", [(value.name, labelfunc(value)) for value in enum])
        super().__init__(label=label, validators=validators, coerce=self._coerce, **kwargs)
        self.enum = enum

    def _coerce(self, value: str | E) -> E:
        if isinstance(value, self.enum):
            return value
        return self.enum[value]  # type: ignore

    def _value(self) -> str:
        if self.data:
            return self.data.name
        else:
            return ""


def unwrap_paragraphs(txt: str) -> str:
    return "\n\n".join([paragraph.replace("\n", " ") for paragraph in txt.split("\n\n")])


class MarkdownField(fields.TextAreaField):
    def _value(self) -> str:
        if self.data:
            return unwrap_paragraphs(self.data)
        else:
            return ""


class KnownMIMEType:
    """Validator that ensures that a content-type field is a known MIME type"""

    def __init__(self, message: str | None = None) -> None:
        if not message:
            message = "Must be a well known MIME type."
        self.message = message
        self.db = mimetypes.MimeTypes()

    def __call__(self, form: Any, field: fields.Field) -> None:
        mimetype, _options = parse_options_header(field.data)

        well_known_types, official_types = self.db.types_map_inv

        if (mimetype not in well_known_types) and (mimetype not in official_types):
            raise ValidationError(self.message)


class Form(FlaskForm):
    @property
    def is_valid(self) -> bool:
        for errors in self.errors.values():
            if errors:
                return False
        return True
