from basingse.auth.testing import LoginClient


def test_home(client: LoginClient) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert b"Welcome Home!" in response.data