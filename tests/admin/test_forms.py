import pytest
from flask import Flask
from markupsafe import Markup
from wtforms import FieldList
from wtforms import Form
from wtforms import StringField

from basingse.admin.forms import ControlButton
from basingse.admin.forms import InteractiveFieldListWidget


def test_render_link_button() -> None:

    class FormTest(Form):
        test = ControlButton(label="Test", action="http://example.com")

    result = FormTest().test()
    assert result == Markup(
        '<a class="btn btn-primary" href="http://example.com" id="test"><label for="test">Test</label></a>'
    )


@pytest.fixture
def app() -> Flask:
    app = Flask(__name__)
    app.config["TESTING"] = True

    @app.route("/admin/form_test_endpoint")
    def form_test_endpoint():
        return "Hello"

    return app


@pytest.mark.xfail
def test_interactive_field_widget(app: Flask) -> None:

    widget = InteractiveFieldListWidget("ul")
    widget.add.label = "New"

    class ListishForm(Form):
        items = FieldList(StringField("hello", "Hello"), widget=widget)

    form = ListishForm()

    with app.test_request_context("/"):
        result = form.items()
        attrs = " ".join(
            [
                'class="btn btn-primary"',
                'hx-get="/admin/form_test_endpoint?rows=1"',
                'hx-swap="beforebegin"',
                'hx-target="#control-items"',
                'id="add-items-btn"',
                'type="button"',
            ]
        )

        assert result == Markup(
            "".join(
                [
                    '<ul class="form-group" id="items">',
                    '<li id="control-items">',
                    f"<button {attrs}>New</button>",
                    "</li>",
                    "</ul>",
                ]
            )
        )
