from collections.abc import Iterator
from uuid import UUID

import pytest
from flask import Flask
from flask import request
from flask import Response
from flask.testing import FlaskClient
from sqlalchemy.orm import make_transient
from sqlalchemy.orm import Session
from werkzeug.exceptions import BadRequest
from werkzeug.exceptions import NotFound

from .conftest import FakePost
from basingse import svcs
from basingse.admin import views

ONE = UUID(int=1)

pytestmark = pytest.mark.usefixtures("adminview", "portal")


@pytest.fixture
def post(app: Flask) -> FakePost:
    with app.app_context():
        session = svcs.get(Session)
        post = FakePost(id=ONE, title="Hello", content="World")
        session.add(post)
        session.commit()
        session.refresh(post)
        make_transient(post)
    return post


@pytest.fixture
def client(app: Flask) -> Iterator[FlaskClient]:
    with app.test_client() as client:
        yield client


@pytest.mark.usefixtures("post")
class TestUnknownEndpoints:

    def test_unknown_endpoint(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/")
        assert response.status_code == 404

    def test_unknown_action(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/posts/do/other/")
        assert response.status_code == 400

    def test_invalid_method(self, client: FlaskClient) -> None:

        response = client.post("/tests/admin/posts/list/")
        assert response.status_code == 405

    def test_invalid_action_method(self, client: FlaskClient) -> None:

        response = client.post("/tests/admin/posts/do/list/")
        assert response.status_code == 405


def test_adminview_new(app: Flask) -> None:

    with app.test_client() as client:

        response = client.get("/tests/admin/posts/new/")
        assert response.status_code == 200
        assert b"Title" in response.data

        response = client.post("/tests/admin/posts/new/", data={"title": "Hello", "content": "World"})
        assert response.status_code == 302
        assert response.headers["Location"] == "/tests/admin/posts/list/"


@pytest.mark.usefixtures("post")
def test_adminview_list(client: FlaskClient) -> None:
    """The list view should contain the post data"""
    response = client.get("/tests/admin/posts/list/")
    assert response.status_code == 200
    assert b"Hello" in response.data
    assert b"World" in response.data


@pytest.mark.usefixtures("post")
def test_adminview_redirect_to_list(client: FlaskClient) -> None:
    """The base url for any admin view should redirect to the list view"""
    response = client.get("/tests/admin/posts/")
    assert response.status_code == 302
    assert response.headers["Location"] == "/tests/admin/posts/list/"


@pytest.mark.usefixtures("post")
def test_adminview_preview(client: FlaskClient) -> None:
    """Can we delete the data"""
    response = client.get(f"/tests/admin/posts/{ONE!s}/preview/")
    assert response.status_code == 200
    assert b"Preview" in response.data


@pytest.mark.usefixtures("post")
def test_adminview_delete(client: FlaskClient) -> None:
    """Can we delete the data"""
    response = client.delete(f"/tests/admin/posts/{ONE!s}/delete/")
    assert response.status_code == 204


@pytest.mark.usefixtures("post")
def test_adminview_delete_via_get(client: FlaskClient) -> None:
    """Can we delete the data"""
    response = client.get(f"/tests/admin/posts/{ONE!s}/delete/")
    assert response.status_code == 302
    assert response.headers["Location"] == "/tests/admin/posts/list/"


@pytest.mark.usefixtures("post")
class TestHtmxSupport:

    def test_request_partial(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/posts/list/?partial=partial", headers={"HX-Request": "GET"})
        assert response.status_code == 200
        assert response.json is not None, "Partial returns json"

    def test_request_no_partial(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/posts/list/", headers={"HX-Request": "GET"})
        assert response.status_code == 200
        assert response.json is None, "HTMX without partial returns full response"


@pytest.mark.usefixtures("post")
class TestCustomAction:

    def test_destructive_action(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/posts/destructive/?arbitrary=arg")
        assert response.status_code == 200

        assert response.json, "Expected JSON response"
        assert response.json["args"]["arbitrary"] == "arg", "Expected to get arguments back"

    def test_regular_action(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/posts/do/partial/?arbitrary=arg")
        assert response.status_code == 200

        assert response.json, "Expected JSON response"
        assert response.json["args"]["arbitrary"] == "arg", "Expected to get arguments back"


@pytest.mark.usefixtures("post")
class TestAdminViewEdit:

    def test_edit_view(self, client: FlaskClient) -> None:
        response = client.get(f"/tests/admin/posts/{ONE!s}/edit/")
        assert response.status_code == 200
        assert b"Hello" in response.data
        assert b"World" in response.data

    def test_edit_post_invalid_data(self, client: FlaskClient, post: FakePost) -> None:
        response = client.post(f"/tests/admin/posts/{ONE!s}/edit/", data={"title": "", "content": "Earth!"})
        assert response.status_code == 200

        post = svcs.get(Session).get(FakePost, post.id)
        assert post, "post not found"
        assert post.content == "World"
        assert post.title == "Hello"

    def test_edit_post(self, client: FlaskClient, post: FakePost) -> None:
        response = client.post(f"/tests/admin/posts/{ONE!s}/edit/", data={"title": "Goodbye", "content": "World!"})
        assert response.status_code == 302
        assert response.headers["Location"] == "/tests/admin/posts/list/"

        post = svcs.get(Session).get(FakePost, post.id)
        assert post, "post not found"
        assert post.content == "World!"
        assert post.title == "Goodbye"

    def test_edit_post_not_found(self, client: FlaskClient) -> None:
        response = client.get(f"/tests/admin/posts/{UUID(int=5)!s}/edit/")
        assert response.status_code == 404


def test_admin_home(client: FlaskClient) -> None:
    # TODO: This should be generic to any portal
    response = client.get("/admin/")
    assert response.status_code == 200
    assert b"Users" in response.data


def test_admin_markdown(client: FlaskClient) -> None:
    # TODO: This should be generic to any portal
    response = client.post("/admin/markdown/?field=content", data={"content": "# Hello World!"})
    assert response.status_code == 200
    assert b"<h1>Hello World!</h1>" in response.data


def test_admin_notfound(app: Flask) -> None:
    with app.test_request_context("/admin/"):
        assert request.blueprint == "admin"
        views.not_found(NotFound())


@pytest.mark.parametrize(
    "exc",
    [400, ValueError(), BadRequest(), BadRequest(response=Response("Bad Request", 400))],
    ids=["int", "ValueError", "BadRequest", "BadRequest.response"],
)
def test_admin_bad_request(app: Flask, exc: BaseException | int) -> None:
    with app.test_request_context("/admin/"):
        assert request.blueprint == "admin"
        views.bad_request(exc)


@pytest.mark.flask
def test_routes(app: Flask) -> None:
    from flask.cli import routes_command

    result = app.test_cli_runner().invoke(routes_command)
    assert result.exit_code == 0
    print(result.output)
