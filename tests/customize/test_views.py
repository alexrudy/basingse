import pytest
from flask import Flask
from flask.testing import FlaskClient
from sqlalchemy.orm import Session

from basingse import svcs
from basingse.attachments import Attachment
from basingse.customize.models import LogoSize
from basingse.customize.models import SiteSettings
from basingse.customize.services import get_site_settings


def logo_fixture(size: LogoSize) -> None:
    settings = get_site_settings()
    session = svcs.get(Session)
    settings = session.get(SiteSettings, settings.id)
    assert settings is not None, "No site settings found"
    settings.logo.set_size(
        size,
        Attachment.from_file(
            "tests/data/logo.png",
            content_type="image/x-icon" if size == LogoSize.FAVICON else "image/png",
        ),
    )

    session.commit()


@pytest.fixture
def large(app: Flask) -> None:
    with app.app_context():
        logo_fixture(LogoSize.LARGE)


@pytest.fixture
def favicon(app: Flask) -> None:
    with app.app_context():
        logo_fixture(LogoSize.FAVICON)


@pytest.fixture
def no_logo(app: Flask) -> None:
    with app.app_context():
        settings = get_site_settings()
        session = svcs.get(Session)
        settings = session.get(SiteSettings, settings.id)
        assert settings is not None, "No site settings found"
        settings.logo.set_size(LogoSize.LARGE, None)
        session.commit()


def test_logo_invalid_size(client: FlaskClient) -> None:
    response = client.get("/brand/logo/invalid")
    assert response.status_code == 400
    assert b"Invalid logo size: invalid" in response.data


@pytest.mark.usefixtures("large")
def test_logo_large(client: FlaskClient) -> None:
    with client.get("/brand/logo/large") as response:
        assert response.status_code == 200
        assert response.content_type == "image/png"


@pytest.mark.usefixtures("no_logo")
def test_logo_notfound(client: FlaskClient) -> None:
    response = client.get("/brand/logo/large")
    assert response.status_code == 404


@pytest.mark.usefixtures("favicon")
def test_favicon(client: FlaskClient) -> None:
    with client.get("/favicon.ico") as response:
        assert response.status_code == 200
        assert response.content_type == "image/x-icon"


@pytest.mark.usefixtures("large")
def test_apple_touch_icon(client: FlaskClient) -> None:
    with client.get("/apple-touch-icon.png") as response:
        assert response.status_code == 200
        assert response.content_type == "image/png"


@pytest.mark.usefixtures("large")
def test_apple_touch_icon_precomposed(client: FlaskClient) -> None:
    with client.get("/apple-touch-icon-precomposed.png") as response:
        assert response.status_code == 200
        assert response.content_type == "image/png"
