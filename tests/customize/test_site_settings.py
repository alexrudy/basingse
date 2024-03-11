import pytest
import structlog
from flask import Flask

from basingse.auth.testing import LoginClient
from basingse.customize.models import LogoSize
from basingse.customize.models import SiteSettings
from basingse.customize.services import get_site_settings

logger = structlog.get_logger(tests="site_settings")


@pytest.mark.usefixtures("app_context")
def test_site_settings_cache_logo() -> None:
    """Test that the logo is loaded and cached"""

    settings = get_site_settings()
    assert isinstance(settings, SiteSettings)

    assert settings.logo.large is not None
    assert settings.logo.large.link.startswith("http://basingse.test/attachments/id")
    assert settings.logo.link(LogoSize.LARGE).startswith("http://basingse.test/attachments/id")
    assert settings.logo.small is None


def test_site_settings_admin_save(app: Flask, client: LoginClient) -> None:
    """Test that the admin save works from the form"""

    resp = client.get("/admin/settings/edit")
    assert resp.status_code == 200
    logger.info("Loaded edit page")

    resp = client.post("/admin/settings/edit", data={"title": "New Title", "active": "1"})
    assert resp.status_code == 302
    assert resp.location == "/admin/settings/edit"
    logger.info("Posted to edit page")

    with app.app_context():
        settings = get_site_settings()
        assert settings.title == "New Title"

        assert settings.logo.large is not None
        assert settings.logo.small is None
        assert settings.logo.text is None
