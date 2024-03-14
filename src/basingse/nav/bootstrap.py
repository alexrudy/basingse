from dominate import tags
from markupsafe import Markup

from . import bar
from . import elements
from basingse.utils.tags import add_cls
from basingse.utils.tags import swap_cls
from basingse.utils.visitor import register
from basingse.utils.visitor import Visitor


class Renderer(Visitor):

    @classmethod
    def render(cls, element: object) -> Markup:
        return Markup(cls().visit(element))


class BootstrapRenderer(Renderer):

    @register(elements.NavElement)
    def visit_nav_element(self, element: elements.NavElement) -> tags.html_tag:
        return tags.comment(f"{self.__class__.__name__} unhandled element {element.__class__.__name__}")

    @register(elements.Link)
    @register(elements.View)
    def visit_link(self, link: elements.Link) -> tags.html_tag:
        a = tags.a(link.text, href=link.url, cls="nav-link")
        if link.active:
            a.classes.add("active")
            a.attributes["aria-current"] = "page"

        if not link.enabled:
            a.classes.add("disabled")
            # add_cls(a, "disabled")
            a["aria-disabled"] = "true"
        return a

    @register(elements.Separator)
    def visit_separator(self, sep: elements.Separator) -> tags.html_tag:
        return tags.hr(cls="dropdown-divider")

    @register(elements.Dropdown)
    def visit_dropdown(self, dropdown: elements.Dropdown) -> tags.html_tag:
        div = tags.div(cls="dropdown")
        a = tags.a(
            dropdown.title,
            href="#",
            cls="nav-link dropdown-toggle",
            role="button",
            id=dropdown.id,
            aria_haspopup="true",
            aria_expanded="false",
            data_bs_toggle="dropdown",
        )
        div.add(a)
        menu = tags.ul(cls="dropdown-menu", aria_labelledby=dropdown.id)
        for item in dropdown.items:
            tag = swap_cls(self.visit(item), "nav-link", "dropdown-item")
            menu.add(tags.li(tag, __pretty=False))
        div.add(menu)
        return div

    @register(bar.NavBar)
    def visit_navbar(self, navbar: bar.NavBar) -> tags.html_tag:
        nav = tags.nav(cls="navbar navbar-expand-lg bg-body-tertiary")
        container = tags.div(cls="container-fluid")
        nav.add(container)
        for item in navbar.left:
            container.add(self.visit(item))
        add_cls(container[-1], "me-auto")
        for item in navbar.right:
            container.add(add_cls(self.visit(item), "d-flex"))
        return nav

    @register(elements.Nav)
    def visit_nav(self, nav: elements.Nav) -> tags.html_tag:
        active_endpoint = next((item for item in nav.items if item.active), None)
        ul = tags.ul(cls="nav", id=nav.id)

        if (style := nav.style.value) != "":
            add_cls(ul, style)

        if (alignment := nav.alignment.value) != "":
            add_cls(ul, alignment)

        if (endpoint := getattr(active_endpoint, "endpoint", None)) is not None:
            ul["data-endpoint"] = endpoint
        for item in nav.items:
            ul.add(tags.li(self.visit(item), cls="nav-item", __pretty=False))
        return ul

    @register(elements.Text)
    def visit_text(self, text: elements.Text) -> tags.html_tag:
        return tags.span(text.text, cls="nav-link")

    @register(bar.Brand)
    def visit_brand(self, brand: bar.Brand) -> tags.html_tag:
        a = tags.a(brand.text, href=brand.url, cls="navbar-brand", id=brand.id)
        return a

    @register(bar.NavBarCollapse)
    def visit_navbar_collapse(self, collapse: bar.NavBarCollapse) -> tags.html_tag:
        button = tags.button(
            type="button",
            cls="navbar-toggler",
            data_bs_toggle="collapse",
            data_bs_target=f"#{collapse.id}",
            aria_controls=f"{collapse.id}",
            aria_expanded="false",
            aria_label="Toggle navigation",
        )
        button.add(tags.span(cls="navbar-toggler-icon"))
        div = tags.div(cls="collapse navbar-collapse", id=collapse.id)
        for item in collapse.items:
            div.add(self.visit(item))
        return button + div

    @register(bar.NavBarNav)
    def visit_navbar_nav(self, nav: bar.NavBarNav) -> tags.html_tag:
        ul = tags.ul(cls="navbar-nav", id=nav.id)
        for item in nav.items:
            ul.add(tags.li(self.visit(item), cls="nav-item", __pretty=False))
        return ul

    @register(bar.NavBarSearch)
    def visit_navbar_search(self, search: bar.NavBarSearch) -> tags.html_tag:
        form = tags.form(id=search.id)
        input = tags.input(
            type="search",
            cls="form-control me-2",
            placeholder=search.placeholder,
            aria_label=search.placeholder,
        )
        form.add(input)
        form.add(tags.button(search.button or search.placeholder, cls="btn btn-success", type="submit"))
        return form
