from bootlace.icon import Icon
from bootlace.links import View
from flask import Flask

from basingse.admin.portal import PortalMenuItem


def test_portal_menu() -> None:
    menu = PortalMenuItem("Test", ".test", Icon("test"), "test.view")

    assert isinstance(menu.link, View)
    assert menu.link.endpoint.name == ".test"
    assert isinstance(menu.link.text, list)
    assert menu.link.text[-1] == "Test"


def test_portal_menu_permissions(app: Flask) -> None:
    menu = PortalMenuItem("Test", ".test", Icon("test"), "test.view")

    with app.test_request_context("/"):
        assert menu.enabled, "Menu is always enabled when login is disabled"


def test_portal_menu_no_permissions(app: Flask) -> None:
    menu = PortalMenuItem("Test", ".test", "test", "test.view")
    menu.permissions = None

    with app.test_request_context("/"):
        assert menu.enabled, "Menu is enabled when no permissions are provided"
