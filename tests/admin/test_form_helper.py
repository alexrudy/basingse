from flask_wtf.file import FileField
from wtforms import Form
from wtforms.fields import Field
from wtforms.fields import StringField
from wtforms.widgets import FileInput

from basingse.admin.portal import get_form_encoding


class PlainForm(Form):
    name = StringField("Name")


class ProfileForm(Form):
    name = StringField("Name")
    avatar = FileField("Avatar")


class CustomWidgetForm(Form):
    name = StringField("Name")
    avatar = StringField("Avatar", widget=FileInput())


class NoWidgetForm(Form):
    name = StringField("Name")
    avatar = Field("Avatar", widget=None)


def test_infer_form_encoding() -> None:
    assert get_form_encoding(PlainForm()) == "application/x-www-form-urlencoded"
    assert get_form_encoding(ProfileForm()) == "multipart/form-data"
    assert get_form_encoding(CustomWidgetForm()) == "multipart/form-data"
    assert get_form_encoding(NoWidgetForm()) == "application/x-www-form-urlencoded"
