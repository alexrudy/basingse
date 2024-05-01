from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import Page
from basingse import svcs
from basingse.admin.extension import AdminView
from basingse.admin.extension import PortalMenuItem
from basingse.admin.views import portal


class PageAdmin(AdminView, blueprint=portal):
    url = "pages"
    key = "<uuid:id>"
    name = "page"
    model = Page
    nav = PortalMenuItem("Pages", "admin.page.list", "file-text", "page.view")

    def query(self, **kwargs: Any) -> Any:
        session = svcs.get(Session)
        return session.scalars(select(Page).order_by(Page.slug))
