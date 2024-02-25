from typing import Any

from flask import Flask
from markdown_it import MarkdownIt
from markdown_it.renderer import RendererHTML
from markupsafe import Markup
from mdit_py_plugins.footnote import footnote_plugin  # type: ignore[attr-defined]
from mdit_py_plugins.front_matter import front_matter_plugin  # type: ignore[attr-defined]


class BootstrapRender(RendererHTML):
    def blockquote_open(self, tokens: Any, idx: Any, options: Any, env: Any) -> str:
        return "<blockquote class='blockquote'>"


md = MarkdownIt(renderer_cls=BootstrapRender).use(front_matter_plugin).use(footnote_plugin)


def render(text: str) -> Markup:
    if not isinstance(text, str):
        return Markup("")
    return Markup(md.render(text))


def init_app(app: Flask) -> None:
    app.add_template_filter(render, "markdown")
