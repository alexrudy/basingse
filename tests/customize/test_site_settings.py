import pytest
import structlog

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
