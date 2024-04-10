from typing import Any

from bootlace.table import Heading
from bootlace.table import Table
from bootlace.table.columns import CheckColumn
from bootlace.table.columns import Column
from bootlace.table.columns import Datetime
from bootlace.table.columns import EditColumn
from sqlalchemy import select
from sqlalchemy.orm import Session

from .forms import UserEditForm
from .models import User
from .models import UserSchema
from basingse import svcs
from basingse.admin.extension import AdminView
from basingse.admin.extension import PortalMenuItem
from basingse.admin.views import portal


class RoleColumn(Column):
    def cell(self, item: Any) -> Any:
        return ", ".join(role.name for role in getattr(item, self.attribute))


class UserTable(Table):

    username = EditColumn("Email", attribute="email")
    roles = RoleColumn(
        heading="Roles",
    )
    active = CheckColumn(Heading("Active", icon="check"), "is_active")
    administrator = CheckColumn(Heading("Administrator", icon="person"), "is_administrator")
    last_login = Datetime(Heading("Last Login"), "last_login")


class UserAdmin(AdminView, blueprint=portal):
    url = "users"
    key = "<uuid:id>"
    name = "user"
    form = UserEditForm
    model = User
    table = UserTable
    schema = UserSchema
    nav = PortalMenuItem("Users", "admin.user.list", "person-badge", "user.view")

    def query(self, **kwargs: Any) -> Any:
        session = svcs.get(Session)
        return session.scalars(select(User).order_by(User.email))
