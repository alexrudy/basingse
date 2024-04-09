from typing import Any

from bootlace.table import Column
from bootlace.table import Table
from bootlace.table.columns import EditColumn
from sqlalchemy import select
from sqlalchemy.orm import Session

from .forms import PageEditForm
from .models import Page
from basingse import svcs
from basingse.admin.extension import AdminView
from basingse.admin.extension import PortalMenuItem
from basingse.admin.views import portal


class PageTable(Table):

    title = EditColumn("Page", "title")
    slug = Column("Slug", "slug")


class PageAdmin(AdminView, portal=portal):
    url = "pages"
    key = "<uuid:id>"
    name = "page"
    form = PageEditForm
    table = PageTable
    model = Page
    schema = Page.Schema
    nav = PortalMenuItem("Pages", "admin.page.list", "file-text", "page.view")

    def query(self, **kwargs: Any) -> Any:
        session = svcs.get(Session)
        return session.scalars(select(Page).order_by(Page.slug))
