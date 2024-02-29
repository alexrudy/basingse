import dataclasses as dc
from typing import Any

from flask import Flask
from jinja2 import Undefined
from markdown_it import MarkdownIt
from markdown_it.renderer import RendererHTML
from markupsafe import Markup
from mdit_py_plugins.footnote import footnote_plugin  # type: ignore[attr-defined]
from mdit_py_plugins.front_matter import front_matter_plugin  # type: ignore[attr-defined]


class BootstrapRender(RendererHTML):
    def blockquote_open(self, tokens: Any, idx: Any, options: Any, env: Any) -> str:
        return "<blockquote class='blockquote'>"


md = MarkdownIt(renderer_cls=BootstrapRender).use(front_matter_plugin).use(footnote_plugin)


def render(text: str | None) -> Markup | Undefined:
    if text is None:
        return Undefined()
    return Markup(md.render(text))


@dc.dataclass(frozen=True)
class MarkdownOptions:

    def init_app(self, app: Flask) -> None:
        app.add_template_filter(render, "markdown")
