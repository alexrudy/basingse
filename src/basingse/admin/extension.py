import dataclasses as dc
import os.path
import re
from collections.abc import Callable
from collections.abc import Iterable
from typing import Any
from typing import cast
from typing import ClassVar
from typing import Generic
from typing import IO
from typing import TypeVar

import attrs
import click
import structlog
from blinker import Signal
from blinker import signal
from bootlace.table import Table
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
from flask_wtf import FlaskForm as FormBase
from jinja2 import FileSystemLoader
from jinja2 import Template
from marshmallow import ValidationError
from sqlalchemy import delete
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import HTTPException
from wtforms import Form

from basingse.admin.portal import Portal
from basingse.admin.portal import PortalMenuItem
from basingse.auth.permissions import check_permissions
from basingse.auth.permissions import require_permission
from basingse.auth.utils import redirect_next
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


@attrs.define
class FormValidationError(Exception):
    """Indicates that a form was invalid"""

    response: IntoResponse

    def __str__(self) -> str:
        return "Form validation failed"


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


def handle_form_validation(exc: FormValidationError) -> IntoResponse:
    return exc.response


def handle_http_exception(exc: HTTPException) -> IntoResponse:
    if exc.code and exc.code >= 500:
        log.exception("HTTP Exception", exc_info=exc, code=exc.code, description=exc.description)
        raise exc

    if request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json":
        return jsonify(error=str(exc)), getattr(exc, "code", 400)
    return render_template(["admin/400.html", "admin/bad_request.html"], error=exc), exc.code or 400


def register_error_handlers(scaffold: Flask | Blueprint) -> None:

    scaffold.register_error_handler(NoItemFound, handle_notfound)
    scaffold.register_error_handler(ValidationError, handle_validation)
    scaffold.register_error_handler(IntegrityError, handle_integrity)
    scaffold.register_error_handler(FormValidationError, handle_form_validation)
    scaffold.register_error_handler(HTTPException, handle_http_exception)


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


def action(
    *,
    name: str | None = None,
    permission: str,
    url: str,
    methods: list[str] | None = None,
    defaults: dict[str, Any] | None = None,
    attachments: bool = False,
) -> Callable[[Fn], Fn]:
    """Mark a function as an action"""

    def decorate(func: Fn) -> Fn:
        nonlocal name
        if name is None:
            name = func.__name__

        func.action = Action(  # type: ignore[attr-defined]
            name,
            permission=permission,
            url=url,
            methods=methods or [],
            defaults=defaults or {},
            attachments=attachments,
        )
        return func

    return decorate


@attrs.define
class AdminManager(Generic[M]):
    """Manager for admin components"""

    #: The name of the model to manage
    name: str

    #: The model to manage
    model: type[M]


def request_accepts_json() -> bool:
    return request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json"


class AdminView(View, Generic[M]):

    #: Whether to initialize the view on every request
    init_every_request: ClassVar[bool] = False

    #: base url for this view
    url: str

    #: Url template for identifying an individual instance
    key: str

    #: The name of this admin view
    name: ClassVar[str]

    #: The model for this view
    model: type[M]

    #: The permission namespace to use for this view
    permission: ClassVar[str]

    #: A class-specific blueprint, where this view's routes are registered.
    bp: ClassVar[Blueprint]

    # The navigation item for this view
    nav: ClassVar[PortalMenuItem | None] = None

    #: The registered actions for this view
    actions: dict[str, Callable[..., IntoResponse]]

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

    @classmethod
    def schema(cls, **options: Any) -> Schema:
        return cls.model.__schema__()(**options)

    @classmethod
    def table(cls) -> Table:
        return cls.model.__listview__()()

    @classmethod
    def form(cls, obj: M | None = None, **options: Any) -> Form:
        return cls.model.__form__()(obj=obj, **options)

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

    def dispatch_action(self, action: str, **kwargs: Any) -> IntoResponse:
        method = self.actions.get(action)
        if method is None or not hasattr(method, "action"):
            self.logger.error(f"Unimplemented method {action!r}", path=request.path, debug=True)
            abort(400, description=f"Unimplemented method {action!r}")

        if request.method not in method.action.methods:
            self.logger.error(f"Method not allowed {action!r}", path=request.path, method=request.method, debug=True)
            abort(405, description=f"Method not allowed {request.method}")

        if not check_permissions(self.permission, method.action.permission):
            self.logger.error(f"Permission denied {action!r}", path=request.path, permission=method.action.permission)
            abort(401, description=f"Permission denied {method.action.permission}")

        return method(self, **kwargs)

    def render_single(self, obj: M, template: str | list[str | Template], **context: Any) -> IntoResponse:
        if request_accepts_json():
            schema = self.schema()
            return jsonify(schema.dump(obj))

        context[self.name] = obj
        return render_template(template, **context)

    def render_save(self, obj: M, next: str = ".list") -> IntoResponse:
        if request_accepts_json():
            schema = self.schema()
            return jsonify(schema.dump(obj))
        return redirect_next(next)

    def render_list(self, items: Iterable[M], template: str | list[str | Template], **context: Any) -> IntoResponse:
        if request_accepts_json():
            schema = self.schema(many=True)
            return jsonify(data=schema.dump(items))

        context["items"] = items
        return render_template(template, **context)

    def render_delete(self, next: str = ".list") -> IntoResponse:
        if request_accepts_json():
            return jsonify({}), 200

        if request.method == "DELETE":
            return "", 204
        return redirect_next(next)

    def render_form(self, obj: M, form: F, template: str | list[str | Template], **context: Any) -> IntoResponse:
        if request_accepts_json():
            if form.errors:
                return jsonify(errors=form.errors, error="Submission contains invalid data"), 400
            return self.render_single(obj, form)

        context[self.name] = obj
        context["form"] = form
        return render_template(template, **context)

    def query(self) -> Iterable[M]:
        session = get(Session)
        results = session.execute(select(self.model).order_by(self.model.created)).scalars()
        return cast(Iterable[M], results)

    def single(self, **kwargs: Any) -> M:
        session = get(Session)
        if (single := session.scalars(select(self.model).filter_by(**kwargs)).first()) is None:
            raise NoItemFound(self.model, kwargs)
        return single

    def blank(self, **kwargs: Any) -> M:
        return self.model(**kwargs)

    def save(self, obj: M, signal: Signal) -> None:
        session = get(Session)
        session.add(obj)
        session.commit()
        signal.send(self.__class__)

    def process_json(self, *, obj: M, data: dict[str, Any], signal: Signal) -> M:
        obj = self.schema(instance=obj).load(data)
        self.save(obj, signal)
        return obj

    def process_form(self, *, obj: M, form: FormBase, signal: Signal) -> M:
        if form.validate_on_submit():
            form.populate_obj(obj=obj)
            self.save(obj, signal)
            return obj
        raise FormValidationError(
            response=self.render_form(obj, form, [f"admin/{self.name}/edit.html", "admin/portal/edit.html"])
        )

    def process_submit(self, *, obj: M, form: F, signal: Signal) -> IntoResponse:
        if request.method in ["POST", "PATCH", "PUT"] and request.is_json:
            if not isinstance(request.json, dict):
                raise BadRequest("JSON data must be an object")
            obj = self.process_json(obj=obj, data=request.json, signal=signal)
            return self.render_save(obj)
        else:
            obj = self.process_form(obj=obj, form=form, signal=signal)
            return self.render_save(obj)

    @action(permission="view", url="/<key>/", methods=["GET"])
    def view(self, **kwargs: Any) -> IntoResponse:
        obj = self.single(**kwargs)
        return self.render_single(obj, [f"admin/{self.name}/view.html", "admin/portal/view.html"])

    @action(permission="edit", url="/<key>/edit/", methods=["GET", "POST", "PATCH", "PUT"])
    def edit(self, **kwargs: Any) -> IntoResponse:
        obj = self.single(**kwargs)
        return self.process_submit(obj=obj, form=self.form(obj=obj), signal=on_update)

    @action(permission="view", url="/<key>/preview/", methods=["GET"])
    def preview(self, **kwargs: Any) -> IntoResponse:
        obj = self.single(**kwargs)
        return self.render_single(
            obj,
            [f"admin/{self.name}/preview.html", "admin/portal/preview.html"],
        )

    @action(permission="edit", url="/new/", methods=["GET", "POST", "PUT"])
    def new(self, **kwargs: Any) -> IntoResponse:
        obj = self.blank(**kwargs)
        return self.process_submit(obj=obj, form=self.form(obj=obj), signal=on_new, **kwargs)

    @action(name="list", permission="view", url="/list/", methods=["GET"])
    def listview(self, **kwargs: Any) -> IntoResponse:
        items = self.query()
        return self.render_list(
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
        return self.render_delete()

    @classmethod
    def _parent_redirect_to(cls, action: str, **kwargs: Any) -> IntoResponse:
        if request_accepts_json():
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
                    defaults={"action": action.name, **action.defaults},
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

        register_error_handlers(scaffold)

        actions = {}

        for bcls in cls.__mro__:
            for name, attr in bcls.__dict__.items():
                if cls._register_action(name, attr, key):
                    actions[attr.action.name] = attr

        cls.actions = actions
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

        cls.bp.url_defaults(cls.url_defaults_add_identity)

    @classmethod
    def url_defaults_add_identity(cls, endpoint: str, values: dict[str, Any]) -> None:
        """Inject the object identity into the URL if it is part of the endpoint signature

        This makes it so that URLs constructed on pages with a single object (e.g. view/edit)
        do not need to be passed the object identity as a parameter.
        """

        if request.endpoint is None:
            # No endpoint - can't inject identity
            return

        pattern = re.compile(r"<([^>]+)>")

        if (m := pattern.search(cls.key)) is not None:
            parts = m.group(1).split(":")
            key = parts[-1]
        else:
            # Can't inject identity
            return

        if request.view_args and (id := request.view_args.get(key, None)) is not None:
            if current_app.url_map.is_endpoint_expecting(endpoint, key):
                values[key] = id

    # Import/Export CLI commands

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
    def import_subcommand(cls) -> click.Command:

        logger = structlog.get_logger(model=cls.name, command="import")

        @click.command(name=cls.name)
        @click.option("--clear/--no-clear")
        @click.option("--data-key", type=str, help="Key for data in the YAML file")
        @click.argument("filename", type=click.File("r"))
        @with_appcontext
        def importer(filename: IO[str], clear: bool, data_key: str | None) -> None:
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

        importer.help = f"Import {cls.name} data from a YAML file"
        return importer

    @classmethod
    def exporter(cls) -> list[M]:
        session = get(Session)

        items = session.scalars(select(cls.model)).all()
        schema = cls.schema(many=True)
        return schema.dump(items)

    @classmethod
    def export_subcommand(cls) -> click.Command:

        logger = structlog.get_logger(model=cls.name, command="import")

        @click.command(name=cls.name)
        @click.argument("filename", type=click.File("w"))
        @with_appcontext
        def export_command(filename: IO[str]) -> None:
            import yaml

            logger.info(f"Exporting {cls.name}")
            data = cls.exporter()
            yaml.safe_dump({cls.name: data}, filename)

        export_command.help = f"Export {cls.name} data to a YAML file"
        return export_command

    def register_commands(self, group: click.Group) -> None:
        group.add_command(self.import_subcommand())
        group.add_command(self.export_subcommand())


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
