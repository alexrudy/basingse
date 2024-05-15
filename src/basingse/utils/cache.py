from collections.abc import Callable
from typing import Any
from typing import Generic
from typing import overload
from typing import TypeVar


T = TypeVar("T")
F = Callable[[], T]


class SingletonCache(Generic[T]):
    def __init__(self, func: F) -> None:
        self._cached = None
        self._func = func

    def __call__(self, *args: Any, **kwargs: Any) -> T:
        if args or kwargs:
            return self._func(*args, **kwargs)

        if self._cached is None:
            self._cached = value = self._func()
            return value
        return self._cached

    def clear(self) -> None:
        self._cached = None


@overload
def cached(func: None) -> Callable[[F], SingletonCache[T]]: ...


@overload
def cached(func: Callable[[], T]) -> SingletonCache[T]: ...


def cached(func):  # type: ignore[no-untyped-def]
    """Cache the result of a function call as a singleton"""

    def wrapper(func: F) -> F:
        return SingletonCache(func)

    if func is None:
        return wrapper
    return wrapper(func)
