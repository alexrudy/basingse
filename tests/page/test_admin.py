from flask.testing import FlaskClient


def test_admin_edit_get(client: FlaskClient) -> None:
    response = client.get("/admin/pages/new/")
    assert response.status_code == 200
    assert b"New Page" in response.data
