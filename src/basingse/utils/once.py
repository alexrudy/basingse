import atexit
import functools
import weakref
from collections.abc import Callable
from typing import Generic
from typing import ParamSpec
from typing import TypeVar


class NotInitialized:
    """Represents the state of a function decorated by @once when not yet initialized."""

    __slots__ = ()

    def __repr__(self) -> str:
        return "NotInitialized"

    def __eq__(self, other: object) -> bool:
        return False


not_initialized = NotInitialized()

P = ParamSpec("P")
R = TypeVar("R")


class Once(Generic[P, R]):
    _result: R | NotInitialized

    def __init__(self, f: Callable[P, R]) -> None:
        self._inner = f
        functools.wraps(f)(self)
        self._result = not_initialized
        self.register()

    def __call__(self, *args: P.args, **kwargs: P.kwargs) -> R:
        if self._result is not_initialized:
            self._result = self._inner(*args, **kwargs)
        assert not isinstance(self._result, NotInitialized), "Function should be called at least once"
        return self._result

    def reset(self) -> None:
        self._result = not_initialized

    def register(self) -> None:
        ref = weakref.ref(self)

        def _reset():
            self = ref()
            if self:
                self.reset()

        atexit.register(_reset)


def once(f: Callable[P, R]) -> Once[P, R]:
    """A decorator to mark a function which should only be called explicitly once.

    Such functions will cache their return value, and will drop their reference to the
    return value at exit."""
    return Once(f)
