from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import User
from basingse import svcs
from basingse.admin.extension import AdminView
from basingse.admin.extension import PortalMenuItem
from basingse.admin.views import portal


class UserAdmin(AdminView, blueprint=portal):
    url = "users"
    key = "<uuid:id>"
    name = "user"
    model = User
    nav = PortalMenuItem("Users", "admin.user.list", "person-badge", "user.view")

    def query(self, **kwargs: Any) -> Any:
        session = svcs.get(Session)
        return session.scalars(select(User).order_by(User.email))
