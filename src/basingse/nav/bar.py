import dataclasses as dc

from flask import request

from .elements import Nav
from .elements import NavElement
from .elements import SubGroup
from .elements import View
from basingse.utils.tags import ids as element_id


@dc.dataclass
class NavBar(NavElement):
    id: str = dc.field(default_factory=element_id.factory("navbar"))
    left: list[NavElement] = dc.field(default_factory=list)
    right: list[NavElement] = dc.field(default_factory=list)


@dc.dataclass
class Brand(View):
    id: str = dc.field(default_factory=element_id.factory("navbar-brand"))

    @property
    def active(self) -> bool:
        return request.path == self.url


@dc.dataclass
class NavBarCollapse(SubGroup):
    """A collection of nav elements that can be collapsed"""

    id: str = dc.field(default_factory=element_id.factory("navbar-collapse"))


@dc.dataclass
class NavBarNav(Nav):
    """Primary grouping of nav elements in the navbar"""

    id: str = dc.field(default_factory=element_id.factory("navbar-nav"))


@dc.dataclass
class NavBarSearch(NavElement):
    """A search bar for the navbar"""

    id: str = dc.field(default_factory=element_id.factory("navbar-search"))

    placeholder: str = "Search"
    action: str = "#"
    method: str = "GET"
    button: str | None = None

    @property
    def active(self) -> bool:
        return False
