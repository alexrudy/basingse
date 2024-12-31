from typing import Any
from typing import IO
from typing import TYPE_CHECKING

import attrs
import click
import structlog
from bootlace.endpoint import Endpoint
from bootlace.icon import Icon
from bootlace.links import View as ViewLink
from bootlace.nav import NavStyle
from bootlace.nav.core import NavElement
from bootlace.nav.elements import Dropdown
from bootlace.nav.elements import Link
from bootlace.nav.elements import Nav
from bootlace.util import as_tag
from bootlace.util import is_active_blueprint
from bootlace.util import MaybeTaggable
from bootlace.util import render
from flask import Blueprint
from flask import current_app
from flask.cli import with_appcontext
from flask_login import current_user
from jinja2 import Template
from markupsafe import Markup
from sqlalchemy import select
from wtforms import FileField
from wtforms import Form

from basingse import svcs
from basingse.htmx import HtmxProperties
from basingse.models import Session


if TYPE_CHECKING:
    from basingse.admin.extension import AdminView  # noqa: F401

logger = structlog.get_logger()


@attrs.define
class PortalDropdown(Dropdown):

    permissions: str | None = None

    def __init__(self, *, title: MaybeTaggable, icon: str | Icon | None = None, permissions: str | None = None) -> None:

        if isinstance(icon, str):
            icon = Icon(icon)
        if icon:
            title = [icon, " ", title]

        super().__init__(title=title)
        self.permissions = permissions

    @property
    def enabled(self) -> bool:
        if self.permissions is None:
            return True
        return current_user.can(self.permissions)


@attrs.define(init=False)
class PortalMenuItem(Link):
    """
    A menu item for the admin portal
    """

    permissions: str | None = None
    active_for_blueprint: str | None = None

    # This ordering is frozen for backwards compatibility
    def __init__(
        self,
        label: str,
        view: str | Endpoint,
        icon: str | Icon,
        permissions: str,
        active_for_blueprint: str | bool | None = True,
    ) -> None:
        if isinstance(icon, str):
            icon = Icon(icon)

        link = ViewLink(endpoint=view, text=[icon, " ", label])
        if isinstance(active_for_blueprint, bool):
            self.active_for_blueprint = link.blueprint if active_for_blueprint else None
        else:
            self.active_for_blueprint = active_for_blueprint

        super().__init__(link=link)
        self.permissions = permissions

    @property
    def active(self) -> bool:

        blueprint: str | None = self.active_for_blueprint and getattr(self.link, "blueprint", None)
        if blueprint is None:
            return super().active

        return is_active_blueprint(blueprint)

    @property
    def enabled(self) -> bool:
        if self.permissions is None:
            return True
        return current_user.can(self.permissions)


def base_template() -> Template:
    name = current_app.config.get("BASINGSE_ADMIN_BASE_TEMPLATE", ["admin/customize.html", "admin/base.html"])
    return current_app.jinja_env.get_or_select_template(name)


def get_form_encoding(form: Form) -> str:
    """Get the form encoding type"""
    for field in form:
        if isinstance(field, FileField):
            return "multipart/form-data"
        if (widget := getattr(field, "widget", None)) is not None:
            if getattr(widget, "input_type", None) == "file":
                return "multipart/form-data"
    return "application/x-www-form-urlencoded"


class Portal(Blueprint):
    """Blueprint customized for making admin portals with navigation menus"""

    #: The CLI group to use for importers
    importer_group: click.Group

    #: The CLI group to use for exporters
    exporter_group: click.Group

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.sidebar: list[NavElement] = []
        self.admins: "list[type[AdminView]]" = []
        self.context_processor(self.context)
        self.importer_group = click.Group(
            "import",
            help="Import data from YAML files",
        )
        self.importer_group.add_command(import_all)
        self.cli.add_command(self.importer_group)

        self.exporter_group = click.Group(
            "export",
            help="Export data to YAML files",
        )
        self.exporter_group.add_command(export_all)
        self.cli.add_command(self.exporter_group)

    def register_admin(self, view: "type[AdminView]") -> None:
        self.admins.append(view)
        if hasattr(view.model, "__schema__"):
            self.importer_group.add_command(view.import_subcommand())
            self.exporter_group.add_command(view.export_subcommand())
        if view.nav is not None:
            self.sidebar.append(view.nav)

    def _render_nav(self) -> Markup:
        ul = as_tag(Nav([item for item in self.sidebar if item.enabled], style=NavStyle.PILLS))
        ul.classes.add("flex-column", "mb-auto")
        return render(ul)

    def context(self) -> dict[str, Any]:
        return {
            "nav": self._render_nav(),
            "hx": HtmxProperties,
            "base_template": base_template(),
            "form_encoding": get_form_encoding,
        }


@click.command(name="all")
@click.option("--clear/--no-clear")
@click.argument("filename", type=click.File("r"), nargs=-1)
@with_appcontext
@click.pass_context
def import_all(ctx: click.Context, filename: list[IO[str]], clear: bool) -> None:
    """Import all items known from a YAML file"""
    import yaml

    data = {}
    for file in filename:
        data.update(yaml.safe_load(file))
    session = svcs.get(Session)
    portal = svcs.get(Portal)

    logger.info("Importing all", clear=clear, data=data.keys(), models=[cls.name for cls in portal.admins])

    for cls in portal.admins:

        if (items := data.get(cls.name, None)) is None:
            continue

        logger.info(f"Importing {cls.name}", model=cls.name, count=len(items))
        if isinstance(items, list):
            schema = cls.schema(many=True)
            for item in schema.load(items):
                session.add(item)
        else:
            schema = cls.schema()
            session.add(schema.load(items))
        session.flush()

    session.commit()


@click.command(name="all")
@click.argument("filename", type=click.File("w"))
@with_appcontext
@click.pass_context
def export_all(ctx: click.Context, filename: IO[str]) -> None:
    """Export all items known to a YAML file"""
    import yaml

    session = svcs.get(Session)
    portal = svcs.get(Portal)
    data = {}

    for cls in portal.admins:

        logger.info(f"Exporting {cls.name}", model=cls.name)
        items = session.scalars(select(cls.model)).all()
        schema = cls.schema(many=True)
        data[cls.name] = schema.dump(items)

    yaml.safe_dump(data, filename)
