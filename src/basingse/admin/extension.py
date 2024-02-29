import dataclasses as dc
import os.path
from collections.abc import Callable
from collections.abc import Iterator
from typing import Any
from typing import ClassVar
from typing import Generic
from typing import IO
from typing import overload
from typing import TypeVar

import click
import structlog
from basingse.auth.permissions import require_permission
from basingse.auth.utils import redirect_next
from basingse.forms import Form as FormBase
from basingse.models import Model as ModelBase
from basingse.svcs import get
from blinker import signal
from flask import abort
from flask import Blueprint
from flask import current_app
from flask import Flask
from flask import render_template
from flask import request
from flask import url_for
from flask.cli import with_appcontext
from flask.typing import ResponseReturnValue as IntoResponse
from flask.views import View
from flask_attachments import Attachment
from jinja2 import FileSystemLoader
from marshmallow import Schema
from sqlalchemy import delete
from sqlalchemy import select
from sqlalchemy.orm import Session

from .nav import Item
from .nav import Nav
from .table import Table


log = structlog.get_logger(__name__)

M = TypeVar("M", bound=ModelBase)
F = TypeVar("F", bound=FormBase)
Fn = TypeVar("Fn", bound=Callable)

on_new = signal("new")
on_update = signal("update")
on_delete = signal("delete")
on_submit = signal("submit")


@dc.dataclass
class Portal:

    blueprint: Blueprint
    items: list[Item] = dc.field(default_factory=list)

    def add(self, item: Item) -> None:
        self.items.append(item)

    def context(self) -> dict[str, Any]:
        return {"nav": Nav(self.items)}


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


@overload
def action(fn: Fn) -> Fn: ...


@overload
def action(**options: Any) -> Callable[[Any], Callable[[Fn], Fn]]: ...


def action(*args: Any, **options: Any) -> Callable[[Any], Callable[[Fn], Fn]]:
    """Mark a function as an action"""

    def decorate(func: Fn) -> Fn:
        name = options.setdefault("name", func.__name__)

        if name in {"list", "preview"}:
            options.setdefault("permission", "view")
        elif name == "new":
            options.setdefault("permission", "edit")
        else:
            options.setdefault("permission", name)

        if name in {"preview", "edit"}:
            options.setdefault("url", f"/<key>/{name}/")
        else:
            options.setdefault("url", f"/{name}/")

        if options.get("permission") == "view":
            options.setdefault("methods", ["GET"])
        elif options.get("permission") == "edit":
            options.setdefault("methods", ["GET", "POST", "PATCH", "PUT"])
        elif options.get("permission") == "delete":
            options.setdefault("methods", ["GET", "DELETE"])

        func.action = Action(**options)  # type: ignore
        return func

    if args:
        if len(args) > 1:
            raise TypeError(f"action() takes at most 1 positional argument ({len(args)} given)")
        return decorate(args[0])

    return decorate


class AdminView(View, Generic[M, F]):
    #: base url for this view
    url: ClassVar[str]

    #: Url template for identifying an individual instance
    key: ClassVar[str]

    #: The form to use for this view
    form: type[F]

    #: The model to use for this view
    model: type[M]

    #: The schema to use for API responses
    schema: type[Schema] | None = None

    #: The table to use for rendering list views
    table: type[Table] | None = None

    #: The name of this view
    name: ClassVar[str]

    #: The permission namespace to use for this view
    permission: ClassVar[str]

    #: A class-specific blueprint, where this view's routes are registered.
    bp: ClassVar[Blueprint]

    #: The template to use for attachments
    attachments: ClassVar[str | None] = None

    #: The CLI group to use for importers
    importer_group: ClassVar[click.Group] = click.Group("import", help="Import data from YAML files")

    nav: ClassVar[Item | None] = None

    @classmethod
    def sidebar(cls) -> Nav:
        return Nav([scls.nav for scls in iter_subclasses(cls) if scls.nav is not None])

    def __init_subclass__(
        cls, /, blueprint: Blueprint | None = None, namespace: str | None = None, portal: Portal | None = None
    ) -> None:
        super().__init_subclass__()
        if not hasattr(cls, "permission"):
            cls.permission = cls.name

        if portal is not None:
            cls.register_portal(portal)
            cls.register_blueprint(portal.blueprint, namespace, cls.url, cls.key)

        if blueprint is not None:
            cls.register_blueprint(blueprint, namespace, cls.url, cls.key)

    def dispatch_action(self, action: str, **kwargs: Any) -> IntoResponse:
        method = getattr(self, action, None)
        if method is None or not hasattr(method, "action"):
            log.error(f"Unimplemented method {action!r}", path=request.path)
            abort(400)

        return method(**kwargs)

    @classmethod
    def importer(cls, data: dict[str, Any]) -> list[M]:
        if cls.schema is None:
            raise NotImplementedError("No schema defined")
        items = data[cls.name]
        if isinstance(items, list):
            schema = cls.schema(many=True)
            return schema.load(items)
        schema = cls.schema()
        return [schema.load(items)]

    @classmethod
    def importer_command(cls) -> click.Command:
        @click.command(name=cls.name)
        @click.option("--clear/--no-clear")
        @click.argument("filename", type=click.File("r"))
        @with_appcontext
        def import_command(filename: IO[str], clear: bool) -> None:
            import yaml

            data = yaml.safe_load(filename)
            session = get(Session)

            if clear:
                log.info(f"Clearing {cls.name}")
                session.execute(delete(cls.model))

            session.add_all(cls.importer(data))
            session.commit()

        import_command.help = f"Import {cls.name} data from a YAML file"
        return import_command

    def dispatch_request(self, **kwargs: Any) -> IntoResponse:
        args = request.args.to_dict()
        for arg in args:
            kwargs.setdefault(arg, args[arg])

        kwargs["action"] = kwargs.pop("action")
        response = self.dispatch_action(**kwargs)
        if request.headers.get("HX-Request"):
            partial = kwargs.get("partial")
            if partial:
                kwargs["action"] = partial
                log.debug("Dispatching for partial", partial=partial)
                return self.dispatch_action(**kwargs)
        return response

    def query(self) -> Any:
        session = get(Session)
        return session.execute(select(self.model).order_by(self.model.created)).scalars()

    def single(self, **kwargs: Any) -> Any:
        session = get(Session)
        if (single := session.scalars(select(self.model).filter_by(**kwargs)).first()) is None:
            abort(404)
        return single

    def process(self, form: F, obj: M) -> bool:
        session = get(Session)
        form.populate_obj(obj=obj)
        session.add(obj)
        session.commit()
        return True

    def render_form(self, form: F, obj: M) -> IntoResponse:
        return render_template(
            [f"admin/{self.name}/edit.html", "admin/portal/edit.html"], **{self.name: obj, "form": form}
        )

    @action()
    def edit(self, **kwargs: Any) -> Any:
        obj = self.single(**kwargs)
        form = self.form(obj=obj)

        if form.validate_on_submit():
            on_submit.send(self.__class__, **kwargs)
            if self.process(form, obj):
                on_update.send(self.__class__, **kwargs)
                return redirect_next(url_for(".list"))
        return self.render_form(form, obj)

    @action(url="/<key>/preview/")
    def preview(self, **kwargs: Any) -> Any:
        obj = self.single(**kwargs)
        return render_template(f"admin/{self.name}/preview.html", **{self.name: obj})

    def blank(self, **kwargs: Any) -> Any:
        return self.model(**kwargs)

    @action(methods=["GET", "POST", "PUT"])
    def new(self, **kwargs: Any) -> Any:
        obj = self.blank(**kwargs)
        form = self.form(obj=obj)

        if form.validate_on_submit():
            on_submit.send(self.__class__, **kwargs)
            if self.process(form, obj):
                log.debug("Saved", name=self.name, obj=obj)
                kwargs["name"] = self.name
                on_new.send(self.__class__, **kwargs)
                return redirect_next(url_for(".list"))

        if form.errors:
            log.error("Errors", errors=form.errors, data=form.data)
        return self.render_form(form, obj)

    @action
    def list(self, **kwargs: Any) -> IntoResponse:
        items = self.query()
        context = {f"{self.name}s": items, "rows": items}
        if self.table is not None:
            context["table"] = self.table()
        return render_template(
            [f"admin/{self.name}/list.html", "admin/portal/list.html"],
            **context,
        )

    @action(permission="edit", methods=["GET", "DELETE"], attachments=True)
    def delete_attachment(self, *, attachment: str, partial: str, **kwargs: Any) -> IntoResponse:
        session = get(Session)
        obj = self.single(**kwargs)
        attachment = session.scalar(select(Attachment).where(Attachment.id == attachment))
        if attachment is not None:
            session.delete(attachment)
            session.commit()
            session.refresh(obj)
        if request.method == "DELETE":
            return "", 204
        form = self.form(obj=obj)
        return render_template(f"{self.attachments}", form=form, **{self.name: obj})

    @action
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
        return redirect_next(url_for(f".{cls.bp.name}.{action}", **kwargs))

    @classmethod
    def register_blueprint(cls, scaffold: Flask | Blueprint, namespace: str | None, url: str, key: str) -> None:
        cls.bp = Blueprint(namespace or cls.name, cls.__module__, url_prefix=f"/{url}/", template_folder="templates/")

        if getattr(cls, "schema", None) is not None:
            cls.importer_group.add_command(cls.importer_command())

        views = {}
        for name in dir(cls):
            if name.startswith("_"):
                continue
            try:
                attr = getattr(cls, name)
                if not callable(attr):
                    continue
                action = getattr(attr, "action", None)
            except Exception:
                log.exception("Error registering action", name=name)
            else:
                if action is not None:
                    if action.attachments and not cls.attachments:
                        continue

                    views[action.name] = view = require_permission(f"{cls.permission}.{action.permission}")(
                        cls.as_view(action.name)
                    )
                    cls.bp.add_url_rule(
                        action.url.replace("<key>", key),
                        endpoint=action.name,
                        view_func=view,
                        methods=action.methods,
                        defaults={"action": name, **action.defaults},
                    )

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

    @classmethod
    def register_portal(cls, portal: "Portal") -> None:
        if cls.nav is not None:
            portal.add(cls.nav)


C = TypeVar("C")


def iter_subclasses(cls: type[C]) -> Iterator[type[C]]:
    subcls: type[C]

    for subcls in cls.__subclasses__():
        yield from iter_subclasses(subcls)
        yield subcls


@AdminView.importer_group.command(name="all")
@click.option("--clear/--no-clear")
@click.argument("filename", type=click.File("r"))
@with_appcontext
def import_all(filename: IO[str], clear: bool) -> None:
    """Import all items known from a YAML file"""
    import yaml

    data = yaml.safe_load(filename)
    session = get(Session)

    for cls in iter_subclasses(AdminView):
        schema = getattr(cls, "schema", None)
        if schema is None:
            continue
        items = data.get(cls.name, None)
        if items is None:
            continue
        log.info(f"Importing {cls.name}", count=len(items))
        if isinstance(items, list):
            schema = schema(many=True)
            for item in schema.load(items):
                session.add(item)
        else:
            schema = schema()
            session.add(schema.load(items))


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
