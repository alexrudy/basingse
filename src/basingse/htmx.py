from enum import StrEnum


class HtmxProperties(dict):
    @property
    def attrs(self) -> dict[str, str]:
        return {f"hx-{key}": value for key, value in self.items()}

    def __str__(self) -> str:
        return " ".join(f"hx-{key}={value}" for key, value in self.items())


class HtmxSwap(StrEnum):
    INNER_HTML = "innerHTML"
    OUTER_HTML = "outerHTML"
    TEXT_CONTENT = "textContent"
    BEFORE_BEGIN = "beforebegin"
    AFTER_BEGIN = "afterbegin"
    BEFORE_END = "beforeend"
    AFTER_END = "afterend"
    DELETE = "delete"
    NONE = "none"
