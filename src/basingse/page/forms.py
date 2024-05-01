from typing import Any

from markupsafe import Markup
from wtforms import StringField
from wtforms.fields import Field
from wtforms.widgets import html_params


class EditorWidget:
    def __call__(self, field: Field, **kwargs: Any) -> Markup:
        kwargs.setdefault("id", field.id)
        params = html_params(type="hidden", id=field.id, value=field._value(), name=field.name)
        return Markup(f'<div class="editor-js"><input {params}/></div>')


class EditorField(StringField):
    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.render_kw = {"class": "editor-js"}

    widget = EditorWidget()
