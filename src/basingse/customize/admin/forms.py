import uuid
from collections.abc import Callable
from typing import TypeVar

from bootlace.forms.fields import MarkdownField
from flask_wtf import FlaskForm
from sqlalchemy import select
from wtforms import BooleanField
from wtforms import FieldList
from wtforms import FormField
from wtforms import HiddenField
from wtforms import IntegerField
from wtforms import StringField
from wtforms import SubmitField
from wtforms import widgets
from wtforms.validators import DataRequired
from wtforms_sqlalchemy.fields import QuerySelectField

from ..models import SocialLink
from basingse import svcs
from basingse.attachments.forms import AttachmentField
from basingse.models import Session
from basingse.page.models import Page

T = TypeVar("T")


def maybe(cls: type[T]) -> Callable[[str | T], T]:
    def converter(value: str | T) -> T:
        if isinstance(value, str):
            return cls(value)  # type: ignore
        return value

    return converter


class OrderField(IntegerField):
    widget = widgets.HiddenInput()


class SocialForm(FlaskForm):
    id = HiddenField(filters=[maybe(uuid.UUID)])
    name = StringField("Network")
    url = StringField("URL")
    icon = StringField("Icon")
    image = AttachmentField("Image Icon")


class FormList(FieldList):
    def populate_obj(self, obj: object, name: str) -> None:
        values = getattr(obj, name, [])
        values = {value.id: value for value in values}
        output = []
        session = svcs.get(Session)

        for entry in self.entries:
            item = values.get(entry["id"].data, SocialLink())
            entry.form.populate_obj(item)
            output.append(session.merge(item))
        setattr(obj, name, output)


class LogoForm(FlaskForm):
    small = AttachmentField("Small", render_kw={"accept": "image/*"})
    large = AttachmentField("Large", render_kw={"accept": "image/*"})
    text = AttachmentField("With Text", render_kw={"accept": "image/*"})
    favicon = AttachmentField("Favicon", render_kw={"accept": "image/icon"})


class SettingsForm(FlaskForm):
    """Edit settings for the website"""

    title = StringField(label="Title", validators=[DataRequired()])
    subtitle = StringField(label="Subtitle")

    homepage = QuerySelectField(
        "Homepage",
        get_label="title",
        query_factory=lambda: svcs.get(Session).scalars(select(Page).order_by(Page.slug)),
        allow_blank=True,
    )
    contactpage = QuerySelectField(
        "Contact Page",
        get_label="title",
        query_factory=lambda: svcs.get(Session).scalars(select(Page).order_by(Page.slug)),
        allow_blank=True,
    )
    contact_message = StringField(label="Contact Message")

    footer_message = MarkdownField(label="Footer Message")

    logo = FormField(LogoForm)
    links = FormList(FormField(SocialForm))

    active = BooleanField(label="Published")

    submit = SubmitField(label="Save")
