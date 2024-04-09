import pytest
from flask import Flask

from .conftest import FakePost
from .conftest import FakePostDb
from basingse.admin.extension import Portal


@pytest.mark.usefixtures("adminview")
def test_adminview_new(app: Flask, portal: Portal) -> None:

    app.register_blueprint(portal.blueprint)

    with app.test_client() as client:

        response = client.get("/tests/admin/posts/new/")
        assert response.status_code == 200
        assert b"Title" in response.data

        response = client.post("/tests/admin/posts/new/", data={"title": "Hello", "content": "World"})
        assert response.status_code == 302
        assert response.headers["Location"] == "/tests/admin/posts/list/"


@pytest.mark.usefixtures("adminview")
def test_adminview_list(app: Flask, portal: Portal, db: FakePostDb) -> None:

    app.register_blueprint(portal.blueprint)

    db.posts["Hello"] = FakePost(title="Hello", content="World")

    with app.test_client() as client:

        response = client.get("/tests/admin/posts/list/")
        assert response.status_code == 200
        assert b"Hello" in response.data
        assert b"World" in response.data

        response = client.get("/tests/admin/posts/")
        assert response.status_code == 302
        assert response.headers["Location"] == "/tests/admin/posts/list/"


@pytest.mark.usefixtures("adminview")
def test_adminview_edit(app: Flask, portal: Portal, db: FakePostDb) -> None:

    app.register_blueprint(portal.blueprint)

    db.posts["Hello"] = FakePost(title="Hello", content="World")

    with app.test_client() as client:

        response = client.get("/tests/admin/posts/Hello/edit/")
        assert response.status_code == 200
        assert b"Hello" in response.data
        assert b"World" in response.data

        response = client.post("/tests/admin/posts/Hello/edit/", data={"title": "", "content": "Earth!"})
        assert response.status_code == 200

        response = client.post("/tests/admin/posts/Hello/edit/", data={"title": "Goodbye", "content": "World!"})
        assert response.status_code == 302
        assert response.headers["Location"] == "/tests/admin/posts/list/"

        response = client.get("/tests/admin/posts/edit/Hello/")
        assert response.status_code == 404

        assert db.posts["Goodbye"].content == "World!"
