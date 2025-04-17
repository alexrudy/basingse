import enum
from typing import Any
from typing import Protocol
from typing import TypeVar

import attrs
import structlog
from bootlace import render
from bootlace.endpoint import convert_endpoint
from bootlace.endpoint import Endpoint
from bootlace.endpoint import KeywordArguments
from bootlace.style import ColorClass
from bootlace.util import Tag
from dominate import tags
from flask import request
from flask import url_for
from markupsafe import Markup
from werkzeug.exceptions import BadRequest
from werkzeug.routing.exceptions import BuildError
from wtforms.fields import Field
from wtforms.fields import FieldList
from wtforms.form import Form
from wtforms.validators import ValidationError
from wtforms.widgets import html_params

from basingse.htmx import HtmxProperties
from basingse.htmx import HtmxSwap

log = structlog.get_logger(__name__)

M = TypeVar("M")

BUTTON = "btn"
FIELD_LIST = "field-list"

HtmlPropertyValue = str | bool


class NoEndpoint(BadRequest):
    """Unable to use current endpoint - no endpoint set for request."""


class Widget(Protocol):
    def __call__(self, field: Field, **kwargs: HtmlPropertyValue) -> Markup: ...


class ButtonAction(enum.StrEnum):
    ADD = "add"
    REMOVE = "remove"


def _button(color: ColorClass) -> list[str]:
    return [BUTTON, color.add_to_class(BUTTON)]


def _field_list_class(*parts: str) -> str:
    return "-".join([FIELD_LIST] + list(parts))


class LinkButton:
    """Form widget which renders a link (anchor) styled as a button."""

    def __call__(self, field: Field, **kwargs: HtmlPropertyValue) -> Markup:
        kwargs.setdefault("id", field.id)
        try:
            kwargs.setdefault("href", field.action)  # type: ignore[attr-defined]
        except AttributeError:
            pass
        kwargs.setdefault("class", " ".join(_button(ColorClass.PRIMARY)))

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


@attrs.define
class ControlWidget:
    label: str
    action: ButtonAction
    color: ColorClass

    @classmethod
    def add_btn(cls, label: str) -> "ControlWidget":
        return cls(label=label, action=ButtonAction.ADD, color=ColorClass.PRIMARY)

    @classmethod
    def remove_btn(cls, label: str) -> "ControlWidget":
        return cls(label=label, action=ButtonAction.REMOVE, color=ColorClass.DANGER)

    def __call__(self, field: Field, **kwargs: HtmlPropertyValue) -> Markup:
        classes = kwargs.pop("class_", "")
        if isinstance(classes, str):
            classes = set(classes.split())
        else:
            classes = set()

        classes.update(_button(self.color))
        classes.add(_field_list_class(self.action))
        kwargs.setdefault("class", " ".join(classes))
        kwargs.setdefault("type", "button")
        kwargs["id"] = _field_list_class(field.id, self.action, BUTTON)
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


@attrs.define(frozen=True)
class CurrentEndpoint:
    extra_arguments: KeywordArguments = attrs.field(factory=KeywordArguments, converter=KeywordArguments)

    @property
    def ignore_query(self) -> bool:
        return False

    @property
    def active(self) -> bool:
        return True

    @property
    def name(self) -> str:
        if not request.endpoint:
            raise NoEndpoint()

        return request.endpoint.split(".")[-1]

    @property
    def full_name(self) -> str:
        if not request.endpoint:
            raise NoEndpoint()
        return request.endpoint

    @property
    def blueprint(self) -> str | None:
        return request.blueprint

    @property
    def url(self) -> str:
        return self.build()

    @property
    def url_kwargs(self) -> KeywordArguments:
        args = dict(request.view_args or {})
        args.update(request.args)
        args.update(self.extra_arguments)
        return KeywordArguments(args)

    def build(self, **kwds: Any) -> str:
        args = self.url_kwargs.as_dict()
        args.update(kwds)

        if not request.endpoint:
            raise BuildError(request.endpoint, args, request.method)

        args["_method"] = request.method
        return url_for(request.endpoint, **args)

    def __call__(self, **kwds: Any) -> str:
        return self.build(**kwds)


@attrs.define
class RemovableRowWidget:
    label_position: FieldPosition = FieldPosition.NONE
    control_position: FieldPosition = FieldPosition.POSTFIX
    remove: Widget = attrs.field(factory=lambda: ControlWidget.remove_btn("Remove"))
    li: Tag = Tag(tags.li, classes={"input-group", "my-1"})

    endpoint: Endpoint | CurrentEndpoint = attrs.field(
        converter=convert_endpoint,
        default=Endpoint(name=".do", url_kwargs={"action": "partial", "partial": "field-list"}),
    )

    def __call__(self, field: Field, **kwargs: HtmlPropertyValue) -> Any:
        parts = [str(field(**kwargs))]

        field_name = "-".join(field.id.split("-")[:-1])
        htmx = HtmxProperties(delete=self.endpoint(list="delete", field=field_name))
        self.control_position.insert(parts, f"{self.remove(field, **htmx.attrs)}")
        self.label_position.insert(parts, f"{field.label}")
        inner = "".join(parts)
        row_id = f"row-{field.id}"

        htmx = HtmxProperties(swap=HtmxSwap.DELETE, target="this")

        item = self.li(id=row_id, **htmx.attrs)
        item.add_raw_string(inner)
        return render(item)


@attrs.define
class InteractiveFieldListWidget:
    """A list of fields, each with a delete button, and an add-new button at the bottom"""

    endpoint: Endpoint | CurrentEndpoint = attrs.field(
        converter=convert_endpoint,
        default=Endpoint(name=".do", url_kwargs={"action": "partial", "partial": "field-list", "list": "append"}),
    )

    ul: Tag = Tag(tags.ul)
    li: Tag = Tag(tags.li, classes={"input-group"})

    add: Widget = attrs.field(factory=lambda: ControlWidget.add_btn("Add"))
    row: Widget = attrs.field(factory=lambda: RemovableRowWidget())

    def render_control_row(self, field: Field, **kwargs: Any) -> Markup:
        htmx = HtmxProperties(swap=HtmxSwap.BEFORE_BEGIN, target="this")
        item = self.li(id=f"control-{field.id}", **htmx.attrs)

        htmx = HtmxProperties(get=self.endpoint.build(field=field.id))
        item.add_raw_string(self.add(field, **htmx.attrs))
        return render(item)

    def __call__(self, field: Field, **kwargs: HtmlPropertyValue) -> Markup:
        if not isinstance(field, FieldList):
            raise TypeError("Field must be a FieldList")

        kwargs.setdefault("id", field.id)
        kwargs["class"] = " ".join([_field_list_class("container"), "form-group"])

        htmx = HtmxProperties(target="this", swap=HtmxSwap.OUTER_HTML)

        container = self.ul(**kwargs, **htmx.attrs)
        for subfield in field:
            container.add_raw_string(self.row(subfield, class_="form-control"))

        container.add_raw_string(self.render_control_row(field))
        return render(container)


class UniqueListValidator:
    """Ensure that all items in a list are unique"""

    def __init__(self, message: str = "All items must be unique") -> None:
        self.message = message

    def __call__(self, form: Form, field: Field) -> None:
        if not isinstance(field, FieldList):
            raise TypeError(f"{self.__class__.__name__} requires an instance of {FieldList!r}, got {type(field)!r}")

        values = [item.data for item in field]
        if len(values) != len(set(values)):
            raise ValidationError(self.message)
