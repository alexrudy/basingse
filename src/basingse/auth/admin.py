from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from .forms import UserEditForm
from .models import User
from basingse import svcs
from basingse.admin.extension import AdminView
from basingse.admin.nav import Item
from basingse.admin.table import Heading
from basingse.admin.table import Table
from basingse.admin.table.columns import CheckColumn
from basingse.admin.table.columns import Column
from basingse.admin.table.columns import Datetime
from basingse.admin.table.columns import EditColumn
from basingse.admin.views import portal


class UserTable(Table):

    username = EditColumn("Email", attribute="email")
    roles = Column(
        heading="Roles",
        template="{% for role in row.roles %}{{ role.name }}{% if not loop.last %}, {% endif %}{% endfor %}",
    )
    active = CheckColumn(Heading("Active", icon="check"), "is_active")
    administrator = CheckColumn(Heading("Administrator", icon="person"), "is_administrator")
    last_login = Datetime(Heading("Last Login"), "last_login")


class UserAdmin(AdminView, portal=portal):
    url = "users"
    key = "<uuid:id>"
    name = "user"
    form = UserEditForm
    model = User
    table = UserTable
    nav = Item("Users", "admin.user.list", "person-badge", "user.view")

    def query(self, **kwargs: Any) -> Any:
        session = svcs.get(Session)
        return session.scalars(select(User).order_by(User.email))
