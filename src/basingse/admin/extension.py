import contextlib
import os.path
import re
from collections.abc import Callable
from collections.abc import Iterable
from collections.abc import Iterator
from collections.abc import Mapping
from collections.abc import Sequence
from typing import Any
from typing import cast
from typing import ClassVar
from typing import Generic
from typing import IO
from typing import TypeVar

import attrs
import click
import structlog
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
from werkzeug.exceptions import BadRequestKeyError
from werkzeug.exceptions import HTTPException
from wtforms.fields import FieldList

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
I = TypeVar("I")  # noqa: E741
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
    errors: dict[str, Any]

    def __str__(self) -> str:
        return "Form validation failed"


def format_error_dictionary(errors: dict[str, str]) -> str:
    return "Multiple errors occured:\n  " + "\n  ".join(f"{k}: {v}" for k, v in errors.items())


def handle_notfound(exc: NoItemFound) -> IntoResponse:
    if request_accepts_json():
        return jsonify(error=str(exc)), 404
    return render_template(["admin/404.html", "admin/not_found.html"], error=exc), 404


def handle_validation(exc: ValidationError) -> IntoResponse:
    log.debug("Handling validation error", exc=exc)
    if request_accepts_json():
        if isinstance(exc.messages, dict):
            return jsonify(errors=exc.messages, error=format_error_dictionary(exc.messages)), 400
        return jsonify(error=str(exc)), 400

    return render_template(["admin/validation_error.html", "admin/400.html", "admin/bad_request.html"], error=exc), 400


def handle_integrity(exc: IntegrityError) -> IntoResponse:
    if request_accepts_json():
        return jsonify(error=str(exc)), 400
    return render_template(["admin/400.html", "admin/bad_request.html"], error=exc), 400


def handle_form_validation(exc: FormValidationError) -> IntoResponse:
    log.debug("Handling form validation error", exc=exc)

    if request_accepts_json():
        return jsonify(errors=exc.errors, error=format_error_dictionary(exc.errors)), 400

    return exc.response


def handle_http_exception(exc: HTTPException) -> IntoResponse:
    if exc.code and exc.code >= 500:
        log.exception("HTTP Exception", exc_info=exc, code=exc.code, description=exc.description)
        raise exc

    if request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json":
        return jsonify(error=str(exc)), getattr(exc, "code", 400)
    return render_template(["admin/400.html", "admin/bad_request.html"], error=exc), exc.code or 400


@contextlib.contextmanager
def transform_key_error():
    try:
        yield
    except KeyError as err:
        raise BadRequestKeyError(*err.args) from err


def register_error_handlers(scaffold: Flask | Blueprint) -> None:
    scaffold.register_error_handler(NoItemFound, handle_notfound)
    scaffold.register_error_handler(ValidationError, handle_validation)
    scaffold.register_error_handler(IntegrityError, handle_integrity)
    scaffold.register_error_handler(FormValidationError, handle_form_validation)
    scaffold.register_error_handler(HTTPException, handle_http_exception)


@attrs.define
class Action:
    """
    Record for admin action decorators
    """

    name: str
    permission: str
    url: str
    methods: list[str] = attrs.field(factory=list)
    defaults: dict[str, Any] = attrs.field(factory=dict)
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


@attrs.define(init=False, repr=False)
class ViewKey:
    name: str = attrs.field()
    argtype: str = attrs.field()

    @property
    def template(self) -> str:
        return f"<{self.argtype}:{self.name}>"

    def __init__(self, key: str) -> None:
        pattern = re.compile(r"<([^>:]+):([^>:]+)>")
        if (m := pattern.match(key)) is not None:
            self.argtype = m.group(1)
            self.name = m.group(2)
        else:
            raise ValueError(f"Unable to parse URL key {key}")

    def __repr__(self) -> str:
        return f"<{self.argtype}:{self.name}>"


def request_accepts_json() -> bool:
    return request.accept_mimetypes.best_match(["text/html", "application/json"]) == "application/json"


def _get_model_attributes(parameters: Mapping[str, Any], model: type[ModelBase]) -> Iterator[tuple[str, Any]]:
    for key, value in parameters.items():
        if key in model.__mapper__.attrs:
            yield (key, value)


def _get_model_attrs_from_request(model: type[ModelBase]) -> dict[str, Any]:
    filters: dict[str, Any] = {}
    if request.view_args is not None:
        filters.update(_get_model_attributes(request.view_args, model))
    filters.update(_get_model_attributes(request.args, model))
    return filters


class AdminView(View, Generic[M, I]):
    #: Whether to initialize the view on every request
    init_every_request: ClassVar[bool] = False

    #: base url for this view
    url: ClassVar[str]

    #: Url template for identifying an individual instance
    key: ClassVar[str]

    _bss_key: ClassVar[ViewKey]

    #: The name of this admin view
    name: ClassVar[str]

    #: The model for this view
    model: type[M]

    #: The type of the model's ID field
    id_type: type[I]

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
            cls._bss_key = ViewKey(cls.key)

            if not hasattr(cls, "permission"):
                cls.permission = cls.name
            cls.register_blueprint(blueprint, namespace, cls.url, cls._bss_key)
        elif any(hasattr(cls, attr) for attr in {"url", "key", "model", "name"}):
            raise NotImplementedError("Concrete subclasses must pass the blueprint to the class definition")

    @classmethod
    def schema(cls, **options: Any) -> Schema:
        return cls.model.__schema__()(**options)

    @classmethod
    def table(cls) -> Table:
        return cls.model.__listview__()()

    @classmethod
    def form(cls, obj: M | None = None, **options: Any) -> FormBase:
        return cls.model.__form__()(obj=obj, **options)

    def dispatch_request(self, *, action: str | None = None, **kwargs: Any) -> IntoResponse:
        if action is None:
            abort(400, description="No action specified")

        self.logger.debug("Dispatching", action=action, **kwargs)
        if request.headers.get("HX-Request"):
            if (partial := request.args.get("partial")) is not None:
                self.logger.debug("Dispatching for partial", partial=partial)
                return self.dispatch_action(action=partial, **kwargs)
        return self.dispatch_action(action=action, **kwargs)

    def dispatch_action(self, action: str, **kwargs: Any) -> IntoResponse:
        method = self.actions.get(action)
        if method is None or not hasattr(method, "action"):
            self.logger.error(f"Unimplemented method {action!r}", path=request.path, debug=True)
            abort(400, description=f"Unimplemented method {action!r}")

        settings = cast(Action, method.action)  # pyright: ignore
        if request.method not in settings.methods:
            self.logger.error(
                f"Method not allowed {action!r}",
                path=request.path,
                method=request.method,
                debug=True,
            )
            abort(405, description=f"Method not allowed {request.method}")

        if not check_permissions(self.permission, settings.permission):
            self.logger.error(
                f"Permission denied {action!r}",
                path=request.path,
                permission=settings.permission,
            )
            abort(401, description=f"Permission denied {settings.permission}")

        return method(self, **kwargs)

    def query(self) -> Iterable[M]:
        filters = _get_model_attrs_from_request(self.model)
        log.debug(f"query multiple {self.name}", filters=filters)

        session = get(Session)
        results = session.execute(select(self.model).order_by(self.model.created)).scalars()
        return cast(Iterable[M], results)

    def single(self, id: I) -> M:
        assert request.view_args is not None, f"Processing unknown view, expected endpoint in {self.bp}"
        filters = _get_model_attrs_from_request(self.model)
        filters[self._bss_key.name] = id
        log.debug(f"query single {self.name}", filters=filters)
        session = get(Session)
        if (single := session.scalars(select(self.model).filter_by(**filters)).first()) is None:
            raise NoItemFound(self.model, filters)
        return single

    def blank(self, **kwargs: Any) -> M:
        assert request.view_args is not None, f"Processing unknown view, expected endpoint in {self.bp}"
        attrs = _get_model_attrs_from_request(self.model)
        log.debug(f"create blank {self.name}", attrs=attrs)
        return self.model(**attrs)

    def render_json(self, item: M | Iterable[M]) -> IntoResponse:
        log.debug(f"Rendering JSON for {self.name}", item=item)
        if isinstance(item, self.model):
            return jsonify(self.schema().dump(item))
        else:
            return jsonify(data=self.schema(many=True).dump(item))

    def render_template(
        self,
        *templates: str,
        item: M | Iterable[M],
        context: dict[str, Any] | None = None,
        extra_templates: Sequence[str] | None = None,
    ) -> IntoResponse:
        log.debug(f"Rendering {templates!r} for {self.name}", item=item, context=context)
        if context is None:
            context = {}
        template_files: list[str | Template] = []
        for template in templates:
            template_files.append(f"admin/{self.name}/{template}.html")
            template_files.append(f"admin/portal/{template}.html")
        if extra_templates is not None:
            template_files.extend(extra_templates)
        if isinstance(item, self.model):
            context["item"] = context[self.name] = item
        else:
            context["items"] = context[self.model.__tablename__] = item

        return render_template(template_files, **context)

    def render(
        self,
        *templates: str,
        item: M | Iterable[M],
        context: dict[str, Any] | None = None,
    ) -> IntoResponse:
        if request_accepts_json():
            return self.render_json(item=item)

        return self.render_template(*templates, item=item, context=context)

    def process(self, *, obj: M) -> M | None:
        if request.is_json and request.method in ["POST", "PUT", "PATCH"]:
            data: dict[str, Any] | list[Any] | None = request.json
            if not isinstance(data, dict):
                raise BadRequest("No JSON data provided")
            schema = self.schema(instance=obj)
            obj = schema.load(data)  # pyright: ignore
            return obj
        else:
            form = self.form(obj=obj)
            if form.validate_on_submit():
                form.populate_obj(obj=obj)
                return obj
            elif form.errors:
                raise FormValidationError(
                    response=self.render("edit", item=obj, context={"form": form}),
                    errors=form.errors,
                )

        return None  # No changes applied

    @action(permission="view", url="/<key>/", methods=["GET"])
    def view(self, id: I) -> IntoResponse:
        obj = self.single(id=id)
        return self.render("view", item=obj, context={})

    @action(permission="edit", url="/<key>/edit/", methods=["GET", "POST", "PATCH", "PUT"])
    def edit(self, id: I) -> IntoResponse:
        obj = self.single(id=id)
        if (updated := self.process(obj=obj)) is not None:
            session = get(Session)
            session.add(updated)
            session.commit()
            on_update.send(self.__class__, id=id)
            return self.redirect(".list", item=obj)
        return self.render("edit", item=obj, context={"form": self.form(obj=obj)})

    @action(name="field-list", permission="edit", url="/<key>/edit/field-list/", methods=["GET", "DELETE"])
    def form_field_list(self, id: I) -> IntoResponse:
        field_name = request.args["field"]
        action = request.args.get("list", "append")
        obj = self.single(id=id)
        form = self.form(obj=obj)
        with transform_key_error():
            field = form
            for part in field_name.split("-"):
                try:
                    part = int(part)
                except ValueError:
                    pass
                field = field[part]  # type: ignore

        if not isinstance(field, FieldList):
            raise BadRequest(f"FieldList requested, but found {type(field)!r}")

        if action == "append":
            field.append_entry()
            return self.render_template("field_list", item=obj, context={"field": field})
        elif action == "delete":
            target = request.headers["HX-target"]
            entries = field.entries[:]
            field.entries.clear()
            for entry in entries:
                if entry.id == target:
                    continue
                else:
                    field.append_entry(entry.data)
            return self.render_template("field", item=obj, context={"field": field})
        raise BadRequest(f"field-list requires a known action, got {action}")

    @action(name="field", permission="edit", url="/<key>/edit/field/", methods=["GET", "POST", "DELETE"])
    def form_field(self, id: I) -> IntoResponse:
        field_name = request.args["field"]
        obj = self.single(id=id)
        form = self.form(obj=obj)
        with transform_key_error():
            field = form
            for part in field_name.split("-"):
                try:
                    part = int(part)
                except ValueError:
                    pass
                field = field[part]  # type: ignore
        return self.render_template("field", item=obj, context={"field": field})

    def redirect(self, endpoint: str, *, item: M) -> IntoResponse:
        if request_accepts_json():
            return jsonify(self.schema().dump(item))
        return redirect_next(endpoint)

    @action(permission="view", url="/<key>/preview/", methods=["GET"])
    def preview(self, id: I) -> IntoResponse:
        obj = self.single(id=id)
        return self.render("preview", item=obj)

    @action(permission="edit", url="/new/", methods=["GET", "POST", "PUT"])
    def new(self) -> IntoResponse:
        obj = self.blank()
        if (updated := self.process(obj=obj)) is not None:
            session = get(Session)
            session.add(updated)
            session.commit()
            on_new.send(self.__class__)
            return self.redirect(".list", item=obj)
        return self.render("new", "edit", item=obj, context={"form": self.form(obj=obj)})

    @action(name="list", permission="view", url="/list/", methods=["GET"])
    def listview(self) -> IntoResponse:
        objects = self.query()

        return self.render("list", item=objects, context={"table": self.table()})

    @action(permission="delete", methods=["GET", "DELETE"], url="/<key>/delete/")
    def delete(self, id: I) -> IntoResponse:
        obj = self.single(id=id)

        args = {self.name: obj}
        log.debug(f"deleting {self.name}", **args)
        session = get(Session)
        session.delete(obj)
        session.commit()
        on_delete.send(self.__class__, id=id)

        if request_accepts_json():
            return jsonify({"success": True, "id": id}), 200

        if request.method == "DELETE":
            return "", 204
        return redirect_next(".list")

    @classmethod
    def _parent_redirect_to(cls, action: str, **kwargs: Any) -> IntoResponse:
        if request_accepts_json():
            log.debug("Redirecting to action", action=action, kwargs=kwargs)
            return cls().dispatch_action(action, **kwargs)

        return redirect_next(url_for(f".{cls.bp.name}.{action}", **kwargs))

    @classmethod
    def _register_action(cls, name: str, attr: Any, key: ViewKey) -> Any:
        if name.startswith("_"):
            # Skip private and dunder methods so we don't end up in a weird attr situation.
            return None

        try:
            action = getattr(attr, "action", None)
        except Exception:  # pragma: nocover
            log.exception("Exception registering action", name=name, debug=True)
        else:
            if action is not None:
                view = require_permission(f"{cls.permission}.{action.permission}")(cls.as_view(action.name))
                cls.bp.add_url_rule(
                    action.url.replace("<key>", key.template),
                    endpoint=action.name,
                    view_func=view,
                    methods=action.methods,
                    defaults={"action": action.name, **action.defaults},
                )
                return view
        return None

    @classmethod
    def register_blueprint(cls, scaffold: Flask | Blueprint, namespace: str | None, url: str, key: ViewKey) -> None:
        cls.bp = AdminBlueprint(
            namespace or cls.name,
            cls.__module__,
            url_prefix=f"/{url}/",
            template_folder="templates/",
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
            f"/{key}/do/<action>/",
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

        if cls.name not in request.endpoint:
            # Not our endpoint - don't inject.
            return

        key = cls._bss_key.name

        if request.view_args and (id := request.view_args.get(key, None)) is not None and cls.name in endpoint:
            if current_app.url_map.is_endpoint_expecting(endpoint, key):
                values.setdefault(key, id)

    # Import/Export CLI commands

    @classmethod
    def importer(cls, data: dict[str, Any]) -> list[M]:
        try:
            items = data[cls.name]
        except (KeyError, TypeError, IndexError):
            items = data

        if isinstance(items, list):
            schema = cls.schema(many=True)
            return schema.load(items)  # pyright: ignore
        schema = cls.schema()
        return [schema.load(items)]  # pyright: ignore

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
        return schema.dump(items)  # pyright: ignore

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
