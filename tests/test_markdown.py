import pytest
from jinja2 import Undefined
from markupsafe import Markup

from basingse.markdown import md
from basingse.markdown import render


@pytest.mark.parametrize(
    "source, expected",
    [
        pytest.param("# Hello World", "<h1>Hello World</h1>", id="h1"),
        pytest.param("> Blockquote", "<blockquote class='blockquote'><p>Blockquote</p></blockquote>", id="blockquote"),
    ],
)
def test_markdown(source: str, expected: str) -> None:
    assert md.render(source).replace("\n", "") == expected


def test_render_filter() -> None:
    assert render(None) == Undefined()
    assert render("Hello World") == Markup("<p>Hello World</p>\n")
