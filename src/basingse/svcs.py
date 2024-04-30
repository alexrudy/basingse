import atexit
from collections.abc import Awaitable
from collections.abc import Callable
from typing import overload

from flask import current_app
from flask import Flask
from flask import g
from flask.ctx import _AppCtxGlobals
from flask.ctx import has_app_context
from svcs import Container
from svcs import Registry

_CONTAINER_KEY = "svcs"
_REGISTRY_KEY = "svcs.registry"

from svcs._core import (
    T1,
    T2,
    T3,
    T4,
    T5,
    T6,
    T7,
    T8,
    T9,
    T10,
    ServicePing,
)


def init_app(app: Flask) -> None:
    app.extensions[_REGISTRY_KEY] = Registry()
    app.teardown_appcontext(teardown)
    atexit.register(close_registry, app)


def register_factory(
    app: Flask,
    svc_type: type,
    factory: Callable,
    *,
    enter: bool = True,
    ping: Callable | None = None,
    on_registry_close: Callable | Awaitable | None = None,
) -> None:
    app.extensions[_REGISTRY_KEY].register_factory(
        svc_type, factory, enter=enter, ping=ping, on_registry_close=on_registry_close
    )


def register_value(
    app: Flask,
    svc_type: type,
    value: object,
    *,
    enter: bool = False,
    ping: Callable | None = None,
    on_registry_close: Callable | Awaitable | None = None,
) -> None:
    app.extensions[_REGISTRY_KEY].register_value(
        svc_type, value, enter=enter, ping=ping, on_registry_close=on_registry_close
    )


def teardown(exc: BaseException | None) -> None:
    """
    To be used with :meth:`flask.Flask.teardown_appcontext` that requires to
    take an exception.

    The app context is torn down after the response is sent.
    """
    if has_app_context() and (container := g.pop(_CONTAINER_KEY, None)):
        container.close()


def close_registry(app: Flask) -> None:
    """
    Close the registry on *app*, if present.
    """
    if reg := app.extensions.pop(_REGISTRY_KEY, None):
        reg.close()


@overload
def get(svc_type: type[T1], /) -> T1: ...


@overload
def get(svc_type1: type[T1], svc_type2: type[T2], /) -> tuple[T1, T2]: ...


@overload
def get(svc_type1: type[T1], svc_type2: type[T2], svc_type3: type[T3], /) -> tuple[T1, T2, T3]: ...


@overload
def get(
    svc_type1: type[T1],
    svc_type2: type[T2],
    svc_type3: type[T3],
    svc_type4: type[T4],
    /,
) -> tuple[T1, T2, T3, T4]: ...


@overload
def get(
    svc_type1: type[T1],
    svc_type2: type[T2],
    svc_type3: type[T3],
    svc_type4: type[T4],
    svc_type5: type[T5],
    /,
) -> tuple[T1, T2, T3, T4, T5]: ...


@overload
def get(
    svc_type1: type[T1],
    svc_type2: type[T2],
    svc_type3: type[T3],
    svc_type4: type[T4],
    svc_type5: type[T5],
    svc_type6: type[T6],
    /,
) -> tuple[T1, T2, T3, T4, T5, T6]: ...


@overload
def get(
    svc_type1: type[T1],
    svc_type2: type[T2],
    svc_type3: type[T3],
    svc_type4: type[T4],
    svc_type5: type[T5],
    svc_type6: type[T6],
    svc_type7: type[T7],
    /,
) -> tuple[T1, T2, T3, T4, T5, T6, T7]: ...


@overload
def get(
    svc_type1: type[T1],
    svc_type2: type[T2],
    svc_type3: type[T3],
    svc_type4: type[T4],
    svc_type5: type[T5],
    svc_type6: type[T6],
    svc_type7: type[T7],
    svc_type8: type[T8],
    /,
) -> tuple[T1, T2, T3, T4, T5, T6, T7, T8]: ...


@overload
def get(
    svc_type1: type[T1],
    svc_type2: type[T2],
    svc_type3: type[T3],
    svc_type4: type[T4],
    svc_type5: type[T5],
    svc_type6: type[T6],
    svc_type7: type[T7],
    svc_type8: type[T8],
    svc_type9: type[T9],
    /,
) -> tuple[T1, T2, T3, T4, T5, T6, T7, T8, T9]: ...


@overload
def get(
    svc_type1: type[T1],
    svc_type2: type[T2],
    svc_type3: type[T3],
    svc_type4: type[T4],
    svc_type5: type[T5],
    svc_type6: type[T6],
    svc_type7: type[T7],
    svc_type8: type[T8],
    svc_type9: type[T9],
    svc_type10: type[T10],
    /,
) -> tuple[T1, T2, T3, T4, T5, T6, T7, T8, T9, T10]: ...


def get(*types: type) -> object:
    return svcs_from(g).get(*types)


def get_pings() -> list[ServicePing]:
    """
    See :meth:`svcs.Container.get_pings()`.

    See Also:
        :ref:`flask-health`
    """
    return svcs_from(g).get_pings()


def svcs_from(g: _AppCtxGlobals) -> Container:
    if (con := g.get(_CONTAINER_KEY, None)) is None:
        con = Container(current_app.extensions[_REGISTRY_KEY])
        setattr(g, _CONTAINER_KEY, con)

    return con
