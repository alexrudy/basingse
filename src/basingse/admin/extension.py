import dataclasses as dc
import os.path
from collections.abc import Callable
from collections.abc import Iterable
from typing import Any
from typing import ClassVar
from typing import Generic
from typing import IO
from typing import TypeVar

import attrs
import click
import structlog
from blinker import Signal
from blinker import signal
from bootlace.icon import Icon
from bootlace.links import View as ViewLink
from bootlace.nav import NavStyle
from bootlace.nav.elements import Link
from bootlace.nav.elements import Nav
from bootlace.table import Table
from bootlace.util import as_tag
from bootlace.util import render
from flask import abort
from flask import Blueprint
from flask import current_app
from flask import Flask
from flask import jsonify
from flask import render_template
from flask import request
from flask import url_for
from flask.cli import with_appcontext
from flask.typing import ResponseReturnValue as IntoResponse
from flask.views import View
from flask_login import current_user
from flask_wtf import FlaskForm as FormBase
from jinja2 import FileSystemLoader
from jinja2 import Template
from markupsafe import Markup
from marshmallow import ValidationError
from sqlalchemy import delete
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from werkzeug.exceptions import BadRequest
from wtforms import FileField
from wtforms import Form

from basingse.auth.permissions import require_permission
from basingse.auth.utils import redirect_next
from basingse.htmx import HtmxProperties
from basingse.models import Model as ModelBase
from basingse.models.schema import Schema
from basingse.svcs import get

log: structlog.BoundLogger = structlog.get_logger(__name__)

M = TypeVar("M", bound=ModelBase)
F = TypeVar("F", bound=FormBase)
Fn = TypeVar("Fn", bound=Callable)

on_new = signal("new")
on_update = signal("update")
on_delete = signal("delete")


@attrs.define
class NoItemFound(Exception):
    """Indicates that an item was not found"""

    model: type[ModelBase]
    filters: dict[str, Any]

    def __str__(self) -> str:
        filters = ", ".join(f"{k}={v}" for k, v in self.filters.items())
        return f"No {self.model.__name__} found: {filters}"


def handle_notfound(exc: NoItemFound) -> IntoResponse:
    if request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json":
        return jsonify(error=str(exc)), 404
    return render_template(["admin/404.html", "admin/not_found.html"], error=exc), 404


def handle_validation(exc: ValidationError) -> IntoResponse:
    if request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json":
        if isinstance(exc.messages, dict):
            return jsonify(error=exc.messages), 400
        return jsonify(error=str(exc)), 400
    return render_template(["admin/400.html", "admin/bad_request.html"], error=exc), 400


def handle_integrity(exc: IntegrityError) -> IntoResponse:
    if request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json":
        return jsonify(error=str(exc)), 400
    return render_template(["admin/400.html", "admin/bad_request.html"], error=exc), 400


def handle_bad_request(exc: Exception) -> IntoResponse:
    if request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json":
        return jsonify(error=str(exc)), getattr(exc, "code", 400)
    return render_template(["admin/400.html", "admin/bad_request.html"], error=exc), getattr(exc, "code", 400)


@attrs.define(init=False)
class PortalMenuItem(Link):
    """
    A menu item for the admin portal
    """

    permissions: str | None = None

    # This ordering is frozen for backwards compatibility
    def __init__(self, label: str, view: str, icon: str | Icon, permissions: str) -> None:
        if isinstance(icon, str):
            icon = Icon(icon)

        link = ViewLink(endpoint=view, text=[icon, " ", label])

        super().__init__(link=link)
        self.permissions = permissions

    @property
    def enabled(self) -> bool:
        if self.permissions is None:
            return True
        return current_user.can(self.permissions)


class Portal(Blueprint):
    """Blueprint customized for making admin portals with navigation menus"""

    #: The CLI group to use for importers
    importer_group: click.Group

    #: The CLI group to use for exporters
    exporter_group: click.Group

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.sidebar: list[PortalMenuItem] = []
        self.admins: list[type[AdminView]] = []
        self.context_processor(self.context)
        self.importer_group = click.Group(
            "import",
            help="Import data from YAML files",
        )
        self.importer_group.add_command(import_all)

        self.exporter_group = click.Group(
            "export",
            help="Export data to YAML files",
        )
        self.exporter_group.add_command(export_all)

        self.register_error_handler(NoItemFound, handle_notfound)
        self.register_error_handler(ValidationError, handle_validation)
        self.register_error_handler(IntegrityError, handle_integrity)
        self.register_error_handler(400, handle_bad_request)
        self.register_error_handler(405, handle_bad_request)

    def register_admin(self, view: "type[AdminView]") -> None:
        self.admins.append(view)
        if hasattr(view.model, "__schema__"):
            self.importer_group.add_command(view.importer_command())
            self.exporter_group.add_command(view.exporter_command())
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


def get_form_encoding(form: Form) -> str:
    """Get the form encoding type"""
    for field in form:
        if isinstance(field, FileField):
            return "multipart/form-data"
        if (widget := getattr(field, "widget", None)) is not None:
            if getattr(widget, "input_type", None) == "file":
                return "multipart/form-data"
    return "application/x-www-form-urlencoded"


def base_template() -> Template:
    name = current_app.config.get("BASINGSE_ADMIN_BASE_TEMPLATE", ["admin/customize.html", "admin/base.html"])
    return current_app.jinja_env.get_or_select_template(name)


@dc.dataclass
class Action:
    """
    Record for admin action decorators
    """

    name: str
    permission: str
    url: str
    methods: list[str] = dc.field(default_factory=list)
    defaults: dict[str, Any] = dc.field(default_factory=dict)
    attachments: bool = False


def action(**options: Any) -> Callable[[Fn], Fn]:
    """Mark a function as an action"""

    def decorate(func: Fn) -> Fn:
        options.setdefault("name", func.__name__)

        func.action = Action(**options)  # type: ignore
        return func

    return decorate


class AdminView(View, Generic[M]):
    #: base url for this view
    url: ClassVar[str]

    #: Url template for identifying an individual instance
    key: ClassVar[str]

    #: The model to use for this view
    model: type[M]

    #: The name of this view
    name: ClassVar[str]

    #: The permission namespace to use for this view
    permission: ClassVar[str]

    #: A class-specific blueprint, where this view's routes are registered.
    bp: ClassVar[Blueprint]

    # The navigation item for this view
    nav: ClassVar[PortalMenuItem | None] = None

    @property
    def logger(self) -> structlog.stdlib.BoundLogger:
        return structlog.get_logger(model=self.name)

    def __init_subclass__(cls, /, blueprint: Blueprint | None = None, namespace: str | None = None) -> None:
        super().__init_subclass__()

        if blueprint is not None:
            # indicates that we are in a concrete subclass.
            # otherwise we assume we are in an abstract subclass

            if not hasattr(cls, "permission"):
                cls.permission = cls.name
            cls.register_blueprint(blueprint, namespace, cls.url, cls.key)
        elif any(hasattr(cls, attr) for attr in {"url", "key", "model", "name"}):
            raise NotImplementedError("Concrete subclasses must pass the blueprint to the class definition")

    def dispatch_action(self, action: str, **kwargs: Any) -> IntoResponse:
        method = getattr(self, action, None)
        if method is None or not hasattr(method, "action"):
            self.logger.error(f"Unimplemented method {action!r}", path=request.path, debug=True)
            abort(400)

        if request.method not in method.action.methods:
            self.logger.error(f"Method not allowed {action!r}", path=request.path, method=request.method, debug=True)
            abort(405)

        return method(**kwargs)

    @classmethod
    def schema(cls, **options: Any) -> Schema:
        return cls.model.__schema__()(**options)

    @classmethod
    def table(cls) -> Table:
        return cls.model.__listview__()()

    @classmethod
    def form(cls, obj: M | None = None, **options: Any) -> Form:
        return cls.model.__form__()(obj=obj, **options)

    @classmethod
    def importer(cls, data: dict[str, Any]) -> list[M]:

        try:
            items = data[cls.name]
        except (KeyError, TypeError, IndexError):
            items = data

        if isinstance(items, list):
            schema = cls.schema(many=True)
            return schema.load(items)
        schema = cls.schema()
        return [schema.load(items)]

    @classmethod
    def importer_command(cls) -> click.Command:

        logger = structlog.get_logger(model=cls.name, command="import")

        @click.command(name=cls.name)
        @click.option("--clear/--no-clear")
        @click.option("--data-key", type=str, help="Key for data in the YAML file")
        @click.argument("filename", type=click.File("r"))
        @with_appcontext
        def import_command(filename: IO[str], clear: bool, data_key: str | None) -> None:
            import yaml

            data = yaml.safe_load(filename)
            if data_key is not None:
                data = data[data_key]

            session = get(Session)

            if clear:
                logger.info(f"Clearing {cls.name}")
                session.execute(delete(cls.model))

            session.add_all(cls.importer(data))
            session.commit()

        import_command.help = f"Import {cls.name} data from a YAML file"
        return import_command

    @classmethod
    def exporter_command(cls) -> click.Command:

        logger = structlog.get_logger(model=cls.name, command="import")

        @click.command(name=cls.name)
        @click.argument("filename", type=click.File("w"))
        @with_appcontext
        def export_command(filename: IO[str]) -> None:
            import yaml

            logger.info(f"Exporting {cls.name}")
            session = get(Session)

            items = session.scalars(select(cls.model)).all()
            schema = cls.schema(many=True)
            data = schema.dump(items)

            yaml.safe_dump({cls.name: data}, filename)

        export_command.help = f"Export {cls.name} data to a YAML file"
        return export_command

    def dispatch_request(self, **kwargs: Any) -> IntoResponse:
        args = request.args.to_dict()
        for arg in args:
            kwargs.setdefault(arg, args[arg])

        kwargs["action"] = action = kwargs.pop("action")
        self.logger.debug("Dispatching", action=action)
        response = self.dispatch_action(**kwargs)
        if request.headers.get("HX-Request"):
            partial = kwargs.get("partial")
            if partial:
                kwargs["action"] = partial
                self.logger.debug("Dispatching for partial", partial=partial)
                return self.dispatch_action(**kwargs)
        return response

    def render_json(self, obj: M | Iterable[M]) -> IntoResponse:
        """Render the object as JSON"""
        if not isinstance(obj, self.model):
            schema = self.schema(many=True)
            return jsonify(data=schema.dump(obj))

        schema = self.schema()
        return jsonify(schema.dump(obj))

    def render_or_serialize(
        self, obj: M | Iterable[M], template: str | list[str | Template], **context: Any
    ) -> IntoResponse:
        """Render or serialize the object based on the request accept header"""
        if not isinstance(obj, self.model):
            context.setdefault("items", obj)
        else:
            context[self.name] = obj

        mime = request.accept_mimetypes.best_match(["text/html", "application/json"])
        if mime == "application/json":
            return self.render_json(obj)

        return render_template(template, **context)

    def query(self) -> Iterable[M]:
        session = get(Session)
        return session.execute(select(self.model).order_by(self.model.created)).scalars()

    def single(self, **kwargs: Any) -> M:
        session = get(Session)
        if (single := session.scalars(select(self.model).filter_by(**kwargs)).first()) is None:
            raise NoItemFound(self.model, kwargs)
        return single

    @action(permission="view", url="/<key>/", methods=["GET"])
    def view(self, **kwargs: Any) -> IntoResponse:
        obj = self.single(**kwargs)
        return self.render_or_serialize(
            obj,
            [f"admin/{self.name}/view.html", "admin/portal/view.html"],
        )

    def save(self, obj: M, signal: Signal) -> M:
        session = get(Session)
        session.add(obj)
        session.commit()
        signal.send(self.__class__)
        return obj

    def process_json(self, *, obj: M, data: dict[str, Any], signal: Signal) -> IntoResponse:
        obj = self.schema(instance=obj).load(data)
        self.save(obj, signal)
        if request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json":
            return self.render_json(obj)
        return redirect_next(".list")

    def process_form(self, *, obj: M, form: FormBase, signal: Signal) -> IntoResponse:
        if form.validate_on_submit():
            form.populate_obj(obj=obj)
            self.save(obj, signal)
            if request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json":
                return self.render_json(obj)
            return redirect_next(".list")
        if form.errors:
            self.logger.error("Form validation failed", obj=obj, errors=form.errors, debug=True)
        return self.render_form(obj, form)

    def render_form(self, obj: M, form: F) -> IntoResponse:
        if request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json":
            if form.errors:
                return jsonify(errors=form.errors, error="Submission contains invalid data"), 400
            return self.render_json(obj)

        return render_template(
            [f"admin/{self.name}/edit.html", "admin/portal/edit.html"], **{self.name: obj, "form": form}
        )

    def process_submit(self, *, obj: M, form: F, signal: Signal) -> IntoResponse:
        if request.method in ["POST", "PATCH", "PUT"] and request.is_json:
            if not isinstance(request.json, dict):
                raise BadRequest("JSON data must be an object")
            return self.process_json(obj=obj, data=request.json, signal=signal)
        else:
            return self.process_form(obj=obj, form=form, signal=signal)

    @action(permission="edit", url="/<key>/edit/", methods=["GET", "POST", "PATCH", "PUT"])
    def edit(self, **kwargs: Any) -> IntoResponse:
        obj = self.single(**kwargs)
        return self.process_submit(obj=obj, form=self.form(obj=obj), signal=on_update)

    @action(permission="view", url="/<key>/preview/", methods=["GET"])
    def preview(self, **kwargs: Any) -> IntoResponse:
        obj = self.single(**kwargs)
        return self.render_or_serialize(
            obj,
            [f"admin/{self.name}/preview.html", "admin/portal/preview.html"],
        )

    def blank(self, **kwargs: Any) -> M:
        return self.model(**kwargs)

    @action(permission="edit", url="/new/", methods=["GET", "POST", "PUT"])
    def new(self, **kwargs: Any) -> IntoResponse:
        obj = self.blank(**kwargs)
        return self.process_submit(obj=obj, form=self.form(obj=obj), signal=on_new, **kwargs)

    @action(permission="view", url="/list/", methods=["GET"])
    def list(self, **kwargs: Any) -> IntoResponse:
        items = self.query()
        return self.render_or_serialize(
            items,
            [f"admin/{self.name}/list.html", "admin/portal/list.html"],
            table=self.table(),
        )

    @action(permission="delete", methods=["GET", "DELETE"], url="/<key>/delete/")
    def delete(self, **kwargs: Any) -> IntoResponse:
        session = get(Session)
        obj = self.single(**kwargs)

        session.delete(obj)
        session.commit()
        on_delete.send(self.__class__, **kwargs)
        if request.method == "DELETE":
            return "", 204
        return redirect_next(url_for(".list"))

    @classmethod
    def _parent_redirect_to(cls, action: str, **kwargs: Any) -> IntoResponse:
        if request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json":
            log.debug("Redirecting to action", action=action, kwargs=kwargs)
            return cls().dispatch_action(action, **kwargs)

        return redirect_next(url_for(f".{cls.bp.name}.{action}", **kwargs))

    @classmethod
    def _register_action(cls, name: str, attr: Any, key: str) -> Any:
        if name.startswith("_"):
            return None
        try:
            action = getattr(attr, "action", None)
        except Exception:  # pragma: nocover
            log.exception("Error registering action", name=name, debug=True)
        else:
            if action is not None:

                view = require_permission(f"{cls.permission}.{action.permission}")(cls.as_view(action.name))
                cls.bp.add_url_rule(
                    action.url.replace("<key>", key),
                    endpoint=action.name,
                    view_func=view,
                    methods=action.methods,
                    defaults={"action": name, **action.defaults},
                )
                return view
        return None

    @classmethod
    def register_blueprint(cls, scaffold: Flask | Blueprint, namespace: str | None, url: str, key: str) -> None:
        cls.bp = AdminBlueprint(
            namespace or cls.name, cls.__module__, url_prefix=f"/{url}/", template_folder="templates/"
        )

        if isinstance(scaffold, Portal):
            scaffold.register_admin(cls)

        views = {}

        for bcls in cls.__mro__:
            for name, attr in bcls.__dict__.items():
                if view := cls._register_action(name, attr, key):
                    views[attr.action.name] = view

        scaffold.register_blueprint(cls.bp)

        # Register two views on the parent scaffold, to provide fallbacks with sensible names.
        scaffold.add_url_rule(
            f"/{url}/",
            endpoint=f"{cls.name}s",
            view_func=cls._parent_redirect_to,
            methods=["GET"],
            defaults={"action": "list"},
        )

        scaffold.add_url_rule(
            f"/{url}/{key}/",
            endpoint=cls.name,
            view_func=cls._parent_redirect_to,
            defaults={"action": "edit"},
            methods=["GET"],
        )

        cls.bp.add_url_rule(
            "/do/<action>/",
            view_func=cls.as_view("do"),
            methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
        )


@click.command(name="all")
@click.option("--clear/--no-clear")
@click.argument("filename", type=click.File("r"))
@with_appcontext
@click.pass_context
def import_all(ctx: click.Context, filename: IO[str], clear: bool) -> None:
    """Import all items known from a YAML file"""
    import yaml

    data = yaml.safe_load(filename)
    session = get(Session)
    portal = get(Portal)

    log.info("Importing all", clear=clear, data=data.keys(), models=[cls.name for cls in portal.admins])

    for cls in portal.admins:

        if (items := data.get(cls.name, None)) is None:
            continue

        log.info(f"Importing {cls.name}", model=cls.name, count=len(items))
        if isinstance(items, list):
            schema = cls.schema(many=True)
            for item in schema.load(items):
                session.add(item)
        else:
            schema = cls.schema()
            session.add(schema.load(items))

    session.commit()


@click.command(name="all")
@click.argument("filename", type=click.File("w"))
@with_appcontext
@click.pass_context
def export_all(ctx: click.Context, filename: IO[str]) -> None:
    """Export all items known to a YAML file"""
    import yaml

    session = get(Session)
    portal = get(Portal)
    data = {}

    for cls in portal.admins:

        log.info(f"Exporting {cls.name}", model=cls.name)
        items = session.scalars(select(cls.model)).all()
        schema = cls.schema(many=True)
        data[cls.name] = schema.dump(items)

    yaml.safe_dump(data, filename)


class AdminBlueprint(Blueprint):
    @property
    def jinja_loader(self) -> FileSystemLoader | None:  # type: ignore[override]
        searchpath = []
        if self.template_folder:
            searchpath.append(os.path.join(self.root_path, self.template_folder))

        admin = current_app.blueprints.get("admin")
        if admin is not None:
            admin_template_folder = os.path.join(admin.root_path, admin.template_folder)  # type: ignore[arg-type]
            searchpath.append(admin_template_folder)

        return FileSystemLoader(searchpath)
