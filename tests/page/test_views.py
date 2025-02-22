import pytest
from flask import Flask
from flask.testing import FlaskClient
from sqlalchemy.orm import Session

from basingse import svcs
from basingse.page.models import Page
from basingse.page.models.blocks import BlockContent


@pytest.fixture
def page(app: Flask) -> Page:
    with app.app_context():
        session = svcs.get(Session)
        page = Page(title="Test", slug="test")

        content = {
            "time": 1620000000,
            "blocks": [
                {
                    "type": "header",
                    "data": {
                        "text": "Test",
                        "level": 1,
                    },
                },
                {
                    "type": "paragraph",
                    "data": {
                        "text": "This is a test page",
                    },
                },
            ],
        }

        page.blocks = BlockContent.Schema().load(content)
        page.publish()

        session.add(page)
        session.commit()
    return page


@pytest.mark.usefixtures("page")
def test_page_view(client: FlaskClient) -> None:
    response = client.get("/page/test/")
    assert response.status_code == 200
    assert b"Test" in response.data


def test_page_notfound(client: FlaskClient) -> None:
    response = client.get("/page/notfound/")
    assert response.status_code == 404
    assert b"not found" in response.data
