from typing import Any

from basingse import svcs
from basingse.admin.extension import AdminView
from basingse.admin.nav import Item
from basingse.admin.table import Column
from basingse.admin.table import Table
from basingse.admin.table.columns import EditColumn
from basingse.admin.views import portal
from sqlalchemy import select
from sqlalchemy.orm import Session

from .forms import PageEditForm
from .models import Page


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
    nav = Item("Pages", "admin.page.list", "file-text", "page.view")

    def query(self, **kwargs: Any) -> Any:
        session = svcs.get(Session)
        return session.scalars(select(Page).order_by(Page.slug))
