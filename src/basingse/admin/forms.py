import enum
from typing import Any
from typing import TypeVar

import structlog
from markupsafe import Markup
from wtforms.fields import Field
from wtforms.fields import FieldList
from wtforms.form import Form
from wtforms.validators import ValidationError
from wtforms.widgets import html_params


log = structlog.get_logger(__name__)

M = TypeVar("M")


class LinkButton:
    """A link (anchor) rendered as a button."""

    def __call__(self, field: Field, **kwargs: Any) -> Markup:
        kwargs.setdefault("id", field.id)
        kwargs.setdefault("href", field.action)
        kwargs.setdefault("class", "btn btn-primary")

        flags = getattr(field, "flags", {})
        if "disabled" in flags:
            kwargs["disabled"] = True

        params = html_params(**kwargs)

        return Markup(f"<a {params}>{field.label}</a>")


class ControlButton(Field):

    widget = LinkButton()

    def __init__(self, *, action: str, **kwargs: Any) -> None:
        super().__init__(**kwargs)
        self.action = action


class DeleteRowControl:

    def __init__(self, label: str) -> None:
        self.label = label

    def __call__(self, field: Field, **kwargs: Any) -> Markup:
        kwargs.setdefault("class", "btn btn-danger field-list-remove")
        kwargs.setdefault("type", "button")
        kwargs["id"] = f"field-list-{field.id}-remove-btn"
        params = html_params(**kwargs)
        return Markup(f"<button {params}>{self.label}</button>")


class AddRowControl:

    def __init__(self, label: str) -> None:
        self.label = label

    def __call__(self, field: Field, **kwargs: Any) -> Markup:
        kwargs.setdefault("class", "btn btn-primary field-list-add")
        kwargs.setdefault("type", "button")
        kwargs["id"] = f"field-list-{field.id}-add-btn"
        params = html_params(**kwargs)
        return Markup(f"<button {params}>{self.label}</button>")


class FieldPosition(enum.Enum):

    PREFIX = "prefix"
    POSTFIX = "postfix"
    NONE = "none"

    def __str__(self) -> str:
        return self.value

    def insert(self, parts: list[str], item: str) -> None:
        if self is FieldPosition.PREFIX:
            parts.insert(0, item)
        elif self is FieldPosition.POSTFIX:
            parts.append(item)


class InteractiveFieldListWidget:
    """A list of fields, each with a delete button, and an add-new button at the bottom"""

    def __init__(
        self,
        html_tag: str = "ul",
        label_position: FieldPosition = FieldPosition.NONE,
        control_position: FieldPosition = FieldPosition.POSTFIX,
        add: AddRowControl | None = None,
        delete: DeleteRowControl | None = None,
    ):
        self.html_tag = html_tag
        self.label_position = label_position
        self.control_position = control_position
        self.add = add or AddRowControl("Add")
        self.delete = delete or DeleteRowControl("Delete")

    def render_subfield(self, subfield: Field, **kwargs: Any) -> Markup:
        parts = [f"{subfield(class_='form-control')}"]

        self.control_position.insert(parts, f"{self.delete(subfield)}")
        self.label_position.insert(parts, f"{subfield.label}")

        tag = "li"
        inner = "".join(parts)
        row_id = f"row-{subfield.id}"

        return Markup(f"<{tag} {html_params(id=row_id)}>{inner}</{tag}>")

    def render_control_row(self, field: Field, **kwargs: Any) -> Markup:
        params = html_params(id=f"control-{field.id}")
        return Markup(f"<li {params}>{self.add(field)}</li>")

    def __call__(self, field: Field, **kwargs: Any) -> Markup:
        if not isinstance(field, FieldList):
            raise TypeError("Field must be a FieldList")

        kwargs.setdefault("id", field.id)
        kwargs["class"] = "form-group"
        html = [f"<{self.html_tag} {html_params(**kwargs)}>"]
        for subfield in field:
            html.append(self.render_subfield(subfield))

        html.append(self.render_control_row(field))
        html.append("</%s>" % self.html_tag)
        return Markup("".join(html))


class UniqueListValidator:
    """Ensure that all items in a list are unique"""

    def __init__(self, message: str = "All items must be unique") -> None:
        self.message = message

    def __call__(self, form: Form, field: Field) -> None:
        values = [item.data for item in field]
        if len(values) != len(set(values)):
            raise ValidationError(self.message)
