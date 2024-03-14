import dataclasses as dc
import enum
from typing import Any

from flask import request
from flask import url_for

from basingse.utils.tags import ids as element_id


class NavElement:
    """Base class for nav components"""

    @property
    def active(self) -> bool:
        return False

    @property
    def enabled(self) -> bool:
        return True


@dc.dataclass
class Link(NavElement):

    _url: str
    text: str

    @property
    def url(self) -> str:
        return self._url


@dc.dataclass
class View(Link):

    endpoint: str
    url_kwargs: dict[str, Any] = dc.field(default_factory=dict)
    ignore_query: bool = True
    id: str = dc.field(init=False)
    _url: str = dc.field(init=False, default="")

    def __init__(self, text: str, endpoint: str, **kwargs: Any) -> None:

        self.text = text
        self.endpoint = endpoint
        self.url_kwargs = kwargs
        self.id = element_id(f"view-{endpoint}")

    @property
    def url(self) -> str:
        return url_for(self.endpoint, **self.url_kwargs)

    @property
    def active(self) -> bool:
        if request.endpoint != self.endpoint:
            return False

        if request.url_rule is None:
            return False

        if (rule_url := request.url_rule.build(self.url_kwargs, append_unknown=not self.ignore_query)) is None:
            return False

        _, url = rule_url

        return url == request.path


@dc.dataclass
class Separator(NavElement):
    pass


@dc.dataclass
class Text(NavElement):

    text: str

    @property
    def enabled(self) -> bool:
        return False


@dc.dataclass
class SubGroup(NavElement):
    items: list[NavElement]

    @property
    def active(self) -> bool:
        return any(item.active for item in self.items)


class NavStyle(enum.Enum):
    """Styles for the nav element"""

    PLAIN = ""
    TABS = "nav-tabs"
    PILLS = "nav-pills"
    UNDERLINE = "nav-underline"


class NavAlignment(enum.Enum):
    """Alignment for the nav element"""

    DEFAULT = ""
    FILL = "nav-fill"
    JUSTIFIED = "nav-justified"


@dc.dataclass
class Nav(SubGroup):
    id: str = dc.field(default_factory=element_id.factory("nav"))
    style: NavStyle = NavStyle.PLAIN
    alignment: NavAlignment = NavAlignment.DEFAULT


@dc.dataclass
class Dropdown(SubGroup):
    title: str
    id: str = dc.field(default_factory=element_id.factory("bs-dropdown"))
