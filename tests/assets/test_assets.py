from flask.testing import FlaskClient

from basingse.auth.testing import Ok


def test_get_javascript(client: FlaskClient) -> None:

    with client.get("assets/js/main.js") as resp:
        assert resp == Ok()

    with client.get("assets/js/main.js.map") as resp:
        assert resp == Ok()
