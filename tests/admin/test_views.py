from collections.abc import Iterator
from uuid import UUID

import pytest
import werkzeug.exceptions
from flask import Flask
from flask import request
from flask import Response
from flask.testing import FlaskClient
from sqlalchemy.orm import make_transient
from sqlalchemy.orm import Session

from .conftest import FakePost
from basingse import svcs
from basingse.admin import views
from basingse.admin.extension import Action
from basingse.admin.extension import AdminView
from basingse.testing.responses import BadRequest
from basingse.testing.responses import NotFound
from basingse.testing.responses import Ok
from basingse.testing.responses import Redirect

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


@pytest.mark.parametrize(
    "attribute,action",
    [
        ("edit", Action("edit", "edit", "/<key>/edit/", methods=["GET", "POST", "PATCH", "PUT"])),
        ("preview", Action("preview", "view", "/<key>/preview/", methods=["GET"])),
        ("delete", Action("delete", "delete", "/<key>/delete/", methods=["GET", "DELETE"])),
        ("list", Action("list", "view", "/list/", methods=["GET"])),
        ("new", Action("new", "edit", "/new/", methods=["GET", "POST", "PUT"])),
    ],
    ids=["edit", "preview", "delete", "list", "new"],
)
def test_action_definition(attribute: str, action: Action) -> None:
    attr = getattr(AdminView, attribute)
    assert hasattr(attr, "action"), f"{attribute} has no action attribute"
    assert attr.action == action, f"{attribute} action does not match {action}"


@pytest.mark.usefixtures("post")
class TestUnknownEndpoints:

    def test_unknown_endpoint(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/")
        assert response == NotFound()

    def test_unknown_action(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/posts/do/other/")
        assert response == BadRequest()

    def test_invalid_method(self, client: FlaskClient) -> None:

        response = client.post("/tests/admin/posts/list/")
        assert response == BadRequest(status=405)

    def test_invalid_action_method(self, client: FlaskClient) -> None:

        response = client.post("/tests/admin/posts/do/list/")
        assert response == BadRequest(status=405)


def test_adminview_new(app: Flask) -> None:

    with app.test_client() as client:

        response = client.get("/tests/admin/posts/new/")
        assert response == Ok()
        assert b"Title" in response.data

        response = client.post("/tests/admin/posts/new/", data={"title": "Hello", "content": "World"})
        assert response == Redirect("/tests/admin/posts/list/")


@pytest.mark.usefixtures("post")
def test_adminview_list(client: FlaskClient) -> None:
    """The list view should contain the post data"""
    response = client.get("/tests/admin/posts/list/")
    assert response == Ok()
    assert b"Hello" in response.data
    assert b"World" in response.data


@pytest.mark.usefixtures("post")
def test_adminview_redirect_to_list(client: FlaskClient) -> None:
    """The base url for any admin view should redirect to the list view"""
    response = client.get("/tests/admin/posts/")
    assert response == Redirect("/tests/admin/posts/list/")


@pytest.mark.usefixtures("post")
def test_adminview_preview(client: FlaskClient) -> None:
    """Can we delete the data"""
    response = client.get(f"/tests/admin/posts/{ONE!s}/preview/")
    assert response == Ok()
    assert b"Preview" in response.data


@pytest.mark.usefixtures("post")
def test_adminview_delete(client: FlaskClient) -> None:
    """Can we delete the data"""
    response = client.delete(f"/tests/admin/posts/{ONE!s}/delete/")
    assert response == Ok(status=204)


@pytest.mark.usefixtures("post")
def test_adminview_delete_via_get(client: FlaskClient) -> None:
    """Can we delete the data"""
    response = client.get(f"/tests/admin/posts/{ONE!s}/delete/")
    assert response == Redirect("/tests/admin/posts/list/")


@pytest.mark.usefixtures("post")
class TestHtmxSupport:

    def test_request_partial(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/posts/list/?partial=partial", headers={"HX-Request": "GET"})
        assert response == Ok()
        assert response.json is not None, "Partial returns json"

    def test_request_no_partial(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/posts/list/", headers={"HX-Request": "GET"})
        assert response == Ok()
        assert response.json is None, "HTMX without partial returns full response"


@pytest.mark.usefixtures("post")
class TestCustomAction:

    def test_destructive_action(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/posts/destructive/?arbitrary=arg")
        assert response == Ok()
        assert response.json, "Expected JSON response"
        assert response.json["args"]["arbitrary"] == "arg", "Expected to get arguments back"

    def test_regular_action(self, client: FlaskClient) -> None:

        response = client.get("/tests/admin/posts/do/partial/?arbitrary=arg")
        assert response == Ok()

        assert response.json, "Expected JSON response"
        assert response.json["args"]["arbitrary"] == "arg", "Expected to get arguments back"


@pytest.mark.usefixtures("post")
class TestAdminViewEdit:

    def test_edit_view(self, client: FlaskClient) -> None:
        response = client.get(f"/tests/admin/posts/{ONE!s}/edit/")
        assert response == Ok()
        assert b"Hello" in response.data
        assert b"World" in response.data

    def test_edit_post_invalid_data(self, client: FlaskClient, post: FakePost) -> None:
        response = client.post(f"/tests/admin/posts/{ONE!s}/edit/", data={"title": "", "content": "Earth!"})
        assert response == Ok()

        post = svcs.get(Session).get(FakePost, post.id)
        assert post, "post not found"
        assert post.content == "World"
        assert post.title == "Hello"

    def test_edit_post(self, client: FlaskClient, post: FakePost) -> None:
        response = client.post(f"/tests/admin/posts/{ONE!s}/edit/", data={"title": "Goodbye", "content": "World!"})
        assert response == Redirect("/tests/admin/posts/list/")

        post = svcs.get(Session).get(FakePost, post.id)
        assert post, "post not found"
        assert post.content == "World!"
        assert post.title == "Goodbye"

    def test_edit_post_not_found(self, client: FlaskClient) -> None:
        response = client.get(f"/tests/admin/posts/{UUID(int=5)!s}/edit/")
        assert response == NotFound()


@pytest.mark.usefixtures("post")
class TestAdminViewJSON:

    @pytest.fixture
    def client(self, app: Flask) -> Iterator[FlaskClient]:
        with app.test_client() as client:
            client.environ_base["HTTP_ACCEPT"] = "application/json"
            yield client

    def test_json_list(self, client: FlaskClient) -> None:
        response = client.get("/tests/admin/posts/list/")
        assert response == Ok()
        assert response.json is not None, "Expected JSON response"
        assert response.json["data"][0]["title"] == "Hello"
        assert response.json["data"][0]["content"] == "World"

    def test_json_detail(self, client: FlaskClient) -> None:
        response = client.get(f"/tests/admin/posts/{ONE!s}/")
        assert response == Ok()
        assert response.json is not None, "Expected JSON response"
        assert response.json["title"] == "Hello"
        assert response.json["content"] == "World"

    def test_json_detail_not_found(self, client: FlaskClient) -> None:
        response = client.get(f"/tests/admin/posts/{UUID(int=5)!s}/")
        assert response == NotFound()
        assert response.json is not None, "Expected JSON response"
        assert "error" in response.json, "Expected error in JSON response"

    def test_edit_view(self, client: FlaskClient) -> None:
        response = client.get(f"/tests/admin/posts/{ONE!s}/edit/")
        assert response == Ok()
        assert response.json is not None, "Expected JSON response"
        assert response.json["title"] == "Hello"
        assert response.json["content"] == "World"

    def test_edit_post_invalid_data(self, client: FlaskClient, post: FakePost) -> None:
        response = client.post(f"/tests/admin/posts/{ONE!s}/edit/", data={"title": "", "content": "Earth!"})
        assert response == BadRequest()
        assert response.json is not None, "Expected JSON response"
        assert "error" in response.json, "Expected error in JSON response"

        post = svcs.get(Session).get(FakePost, post.id)
        assert post, "post not found"
        assert post.content == "World"
        assert post.title == "Hello"

    def test_edit_post_invalid_json(self, client: FlaskClient, post: FakePost) -> None:
        response = client.post(f"/tests/admin/posts/{ONE!s}/edit/", json={"title": "", "content": "Earth!"})
        assert response == BadRequest()
        assert response.json is not None, "Expected JSON response"
        assert "error" in response.json, "Expected error in JSON response"

        post = svcs.get(Session).get(FakePost, post.id)
        assert post, "post not found"
        assert post.content == "World"
        assert post.title == "Hello"

    def test_edit_post(self, client: FlaskClient, post: FakePost) -> None:
        response = client.post(f"/tests/admin/posts/{ONE!s}/edit/", data={"title": "Goodbye", "content": "World!"})
        assert response == Ok()
        assert response.json is not None, "Expected JSON response"
        assert response.json["title"] == "Goodbye"
        assert response.json["content"] == "World!"

        post = svcs.get(Session).get(FakePost, post.id)
        assert post, "post not found"
        assert post.content == "World!"
        assert post.title == "Goodbye"

    def test_edit_post_json(self, client: FlaskClient, post: FakePost) -> None:
        response = client.post(f"/tests/admin/posts/{ONE!s}/edit/", json={"title": "Goodbye", "content": "World!"})
        assert response == Ok()
        assert response.json is not None, "Expected JSON response"
        assert response.json["title"] == "Goodbye"
        assert response.json["content"] == "World!"

        post = svcs.get(Session).get(FakePost, post.id)
        assert post, "post not found"
        assert post.content == "World!"
        assert post.title == "Goodbye"

    def test_edit_post_json_list(self, client: FlaskClient, post: FakePost) -> None:
        response = client.post(f"/tests/admin/posts/{ONE!s}/edit/", json=[{"title": "Goodbye", "content": "World!"}])
        assert response == BadRequest()
        assert response.json is not None, "Expected JSON response"
        assert "error" in response.json, "Expected error in JSON response"

    def test_edit_post_not_found(self, client: FlaskClient) -> None:
        response = client.get(f"/tests/admin/posts/{UUID(int=5)!s}/edit/")
        assert response == NotFound()
        assert response.json is not None, "Expected JSON response"
        assert "error" in response.json, "Expected error in JSON response"


def test_admin_home(client: FlaskClient) -> None:
    # TODO: This should be generic to any portal
    response = client.get("/admin/")
    assert response == Ok()
    assert b"Users" in response.data


def test_admin_markdown(client: FlaskClient) -> None:
    # TODO: This should be generic to any portal
    response = client.post("/admin/markdown/?field=content", data={"content": "# Hello World!"})
    assert response == Ok()
    assert b"<h1>Hello World!</h1>" in response.data


def test_admin_notfound(app: Flask) -> None:
    with app.test_request_context("/admin/"):
        assert request.blueprint == "admin"
        views.not_found(werkzeug.exceptions.NotFound())


@pytest.mark.parametrize(
    "exc",
    [
        400,
        ValueError(),
        werkzeug.exceptions.BadRequest(),
        werkzeug.exceptions.BadRequest(response=Response("Bad Request", 400)),
    ],
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
