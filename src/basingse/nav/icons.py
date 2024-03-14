import dataclasses as dc

from dominate import svg
from dominate import tags
from dominate.util import text
from flask import url_for

from basingse.nav import elements
from basingse.nav.bootstrap import BootstrapRenderer
from basingse.utils.visitor import register


@dc.dataclass
class Icon:
    """A Bootstrap icon"""

    name: str
    width: int = 16
    height: int = 16


@dc.dataclass
class IconElement(elements.NavElement):
    """A nav element which uses a Bootstrap icon as an indicator"""

    icon: Icon
    text: str
    _url: str

    @property
    def url(self) -> str:
        return self._url


@dc.dataclass
class IconViewElement(elements.View, IconElement):
    """A view element which uses a Bootstrap icon as an indicator"""


class IconNavRenderer(BootstrapRenderer):

    @register(Icon)
    def visit_icon(self, icon: Icon) -> tags.html_tag:
        url = url_for("core.static", filename="icons/bootstrap-icons.svg")
        classes = ["bi", "me-1", "pe-none", "align-self-center"]
        return svg.svg(
            svg.use(xlink_href=f"{url}#{icon.name}"),
            cls=" ".join(classes),
            role="img",
            width=icon.width,
            height=icon.height,
            fill="currentColor",
        )

    @register(IconElement)
    @register(IconViewElement)
    def visit_icon_element(self, element: IconElement) -> tags.html_tag:
        content = tags.div(self.visit(element.icon), text(element.text), cls="pe-2 d-inline-flex align-items-center")
        a = tags.a(content, href=element.url, cls="nav-link")
        if element.active:
            a.classes.add("active")
            a.attributes["aria-current"] = "page"
        return a
