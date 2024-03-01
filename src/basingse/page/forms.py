from typing import Any

from basingse.forms import Form
from basingse.forms import SLUG_VALIDATOR
from markupsafe import Markup
from wtforms import StringField
from wtforms import SubmitField
from wtforms.fields import Field
from wtforms.validators import DataRequired


class EditorWidget:
    def __call__(self, field: Field, **kwargs: Any) -> Markup:
        kwargs.setdefault("id", field.id)
        return Markup(f'<div class="editor-js"><input type="hidden" id="{field.id}"/></div>')  # noqa: B907


class EditorField(StringField):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.render_kw = {"class": "editor-js"}

    widget = EditorWidget()


class PageEditForm(Form):
    title = StringField("Title", validators=[DataRequired()])
    slug = StringField("Slug", validators=[DataRequired(), SLUG_VALIDATOR])

    content = EditorField("Content", validators=[DataRequired()])

    submit = SubmitField("Save")
