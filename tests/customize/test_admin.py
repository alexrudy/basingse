import pytest
import structlog
from flask import Flask
from flask.testing import FlaskClient
from sqlalchemy.orm import make_transient
from sqlalchemy.orm import Session

from basingse import svcs
from basingse.attachments import Attachment
from basingse.customize.admin.forms import maybe
from basingse.customize.models import SocialLink
from basingse.customize.services import get_site_settings
from basingse.customize.services import get_social_links

logger = structlog.get_logger(tests="customize")


@pytest.mark.parametrize(
    "input, expected",
    [
        pytest.param("1", 1, id="string"),
        pytest.param(1, 1, id="int"),
    ],
)
def test_maybe(input: str | int, expected: int) -> None:
    assert maybe(int)(input) == expected


class TestSiteSettings:
    def test_admin_edit_get_default(self, app: Flask, client: FlaskClient) -> None:
        with app.app_context():
            _ = get_site_settings()

        resp = client.get("/admin/settings/edit/")
        assert resp.status_code == 200

    def test_admin_edit_get(self, client: FlaskClient) -> None:
        resp = client.get("/admin/settings/edit/")
        assert resp.status_code == 200

    def test_admin_edit_post(self, app: Flask, client: FlaskClient) -> None:
        resp = client.post("/admin/settings/edit/", data={"title": "New Title", "active": "1"})
        assert resp.status_code == 302
        assert resp.location == "/admin/settings/edit/"

        with app.app_context():
            settings = get_site_settings()
            assert settings.title == "New Title"
            assert settings.logo.large is not None
            assert settings.logo.small is None
            assert settings.logo.text is None

    def test_admin_edit_post_social_links(self, app: Flask, client: FlaskClient) -> None:
        data = {
            "title": "New Title",
            "active": "1",
            "links-0-name": "Facebook",
            "links-0-url": "https://facebook.com",
            "links-1-name": "Twitter",
            "links-1-url": "https://twitter.com",
        }

        resp = client.post("/admin/settings/edit/", data=data)
        assert resp.status_code == 302
        assert resp.location == "/admin/settings/edit/"

        with app.app_context():
            settings = get_site_settings()
            assert settings.title == "New Title"
            assert len(settings.links) == 2
            assert settings.links[0].name == "Facebook"
            assert settings.links[0].url == "https://facebook.com"
            assert settings.links[1].name == "Twitter"
            assert settings.links[1].url == "https://twitter.com"

    def test_admin_delete_logo(self, app: Flask, client: FlaskClient) -> None:
        with app.app_context():
            settings = get_site_settings()
            id = settings.logo.large.id

        resp = client.get(f"/admin/settings/delete-logo/{id}/")
        assert resp.status_code == 200

        with app.app_context():
            settings = get_site_settings()
            assert settings.logo.large is None


class TestSocialLinks:
    @pytest.fixture
    def social_link(self, app: Flask) -> SocialLink:
        with app.app_context():
            session = svcs.get(Session)
            settings = get_site_settings(session)
            link = SocialLink(name="Test", url="https://test.com", site=settings)
            link.image = Attachment.from_file("tests/data/logo.png")
            session.add(link)
            session.commit()
            session.refresh(link)
            make_transient(link)
            return link

    def test_admin_delete_missing_social_image(self, app: Flask, client: FlaskClient) -> None:
        resp = client.get("/admin/settings/social/delete-image/00000000-0000-0000-0000-000000000000/")
        assert resp.status_code == 200

        with app.app_context():
            settings = get_site_settings()
            assert settings.links == []

    def test_admin_delete_social_image(self, app: Flask, client: FlaskClient, social_link: SocialLink) -> None:
        resp = client.get(f"/admin/settings/social/delete-image/{social_link.image_id}/")
        assert resp.status_code == 200

    def test_admin_link_order(self, app: Flask, client: FlaskClient, social_link: SocialLink) -> None:
        with app.app_context():
            session = svcs.get(Session)
            link = SocialLink(name="Another Test", url="https://test.com", site_id=social_link.site_id)
            session.add(link)
            session.commit()
            session.refresh(link)
            make_transient(link)

        data = {
            "item": [
                social_link.id,
                link.id,
            ]
        }

        resp = client.post("/admin/settings/social/order-links/", json=data)
        assert resp.status_code == 204

        with app.app_context():
            links = list(get_social_links())

            assert links[0].name == "Test"
            assert links[1].name == "Another Test"

        resp = client.post("/admin/settings/social/order-links/", json={"item": data["item"][::-1]})
        assert resp.status_code == 204

        with app.app_context():
            links = list(get_social_links())

            assert links[1].name == "Test"
            assert links[0].name == "Another Test"

    def test_admin_link_invalid(self, client: FlaskClient, social_link: SocialLink) -> None:
        data = {
            "item": [
                social_link.id,
                "00000000-0000-0000-0000-000000000000",
            ]
        }

        resp = client.post("/admin/settings/social/order-links/", json=data)
        assert resp.status_code == 400

    def test_admin_link_append(self, app: Flask, client: FlaskClient, social_link: SocialLink) -> None:
        resp = client.get("/admin/settings/social/append-link/")
        assert resp.status_code == 200

        with app.app_context():
            links = list(get_social_links())
            assert len(links) == 2
            assert links[0].name == "Test"
            assert links[0].url == "https://test.com"
            assert links[1].order == 2
            assert links[1].name is None

    def test_admin_delete_link(self, app: Flask, client: FlaskClient, social_link: SocialLink) -> None:
        resp = client.get(f"/admin/settings/social/delete-link/{social_link.id}/")
        assert resp.status_code == 200

        with app.app_context():
            links = list(get_social_links())
            assert len(links) == 0
