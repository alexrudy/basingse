import enum
from collections.abc import Callable
from collections.abc import Iterable
from collections.abc import Mapping
from typing import Any
from typing import Generic
from typing import TypeVar

from marshmallow import fields
from marshmallow.exceptions import ValidationError

E = TypeVar("E", bound=enum.Enum)


class EnumField(fields.Field, Generic[E]):
    """Field that serializes to a string of numbers and deserializes
    to a list of numbers.
    """

    def __init__(
        self,
        enum: type[E],
        *,
        load_default: E | None = None,
        dump_default: E | None = None,
        data_key: str | None = None,
        attribute: str | None = None,
        validate: None | (Callable[[Any], Any] | Iterable[Callable[[Any], Any]]) = None,
        required: bool = False,
        allow_none: bool | None = None,
        load_only: bool = False,
        dump_only: bool = False,
        error_messages: dict[str, str] | None = None,
        metadata: Mapping[str, Any] | None = None,
        **additional_metadata: Any,
    ) -> None:
        self.enum = enum
        super().__init__(
            load_default=load_default,
            dump_default=dump_default,
            data_key=data_key,
            attribute=attribute,
            validate=validate,
            required=required,
            allow_none=allow_none,
            load_only=load_only,
            dump_only=dump_only,
            error_messages=error_messages,
            metadata=metadata,
            **additional_metadata,
        )

    def _serialize(self, value: E | None, attr: str | None, obj: Any, **kwargs: Any) -> str | None:
        if value is None:
            return None
        assert isinstance(value, self.enum)
        return value.name

    def _deserialize(self, value: str | None, attr: str | None, data: Any, **kwargs: Any) -> E | None:
        if value is None:
            return None

        try:
            return self.enum[value.upper()]
        except KeyError as error:
            raise ValidationError(f"Unknown {self.enum.__name__}: {value}") from error
