import pytest
from sqlalchemy import select

from basingse.models import Capability, Role
from sqlalchemy.orm import Session


@pytest.fixture
def capabilities(session: Session) -> None:
    caps = {}
    for c in ["create", "read", "update", "delete", "observe"]:
        caps[c] = Capability(name=c)
        session.add(caps[c])

    roles = {}
    for r in ["superadmin", "admin", "user", "auditor"]:
        roles[r] = Role(name=r)
        session.add(roles[r])

    roles["admin"].direct_capabilities.add(caps["create"])
    roles["admin"].direct_capabilities.add(caps["update"])
    roles["superadmin"].direct_capabilities.add(caps["delete"])

    roles["auditor"].direct_capabilities.add(caps["observe"])

    roles["user"].direct_capabilities.add(caps["read"])
    roles["admin"].contained_roles.add(roles["user"])
    roles["superadmin"].contained_roles.add(roles["admin"])
    session.flush()


@pytest.mark.usefixtures("capabilities")
def test_nested_roles_middle(session: Session) -> None:

    r = session.execute(select(Role).where(Role.name == "admin")).scalar_one()

    assert r.name == "admin"
    assert set(c.name for c in r.capabilities) == {"create", "update", "read"}
    assert len(r.capabilities) == 3


@pytest.mark.usefixtures("capabilities")
def test_nested_roles_root(session: Session) -> None:

    r = session.execute(select(Role).where(Role.name == "superadmin")).scalar_one()

    assert r.name == "superadmin"
    assert set(c.name for c in r.capabilities) == {"create", "update", "read", "delete"}
    assert len(r.capabilities) == 4


@pytest.mark.usefixtures("capabilities")
def test_nested_roles_leaf(session: Session) -> None:

    r = session.execute(select(Role).where(Role.name == "user")).scalar_one()

    assert r.name == "user"

    assert set(c.name for c in r.capabilities) == {"read"}
    assert len(r.capabilities) == 1


@pytest.mark.usefixtures("capabilities")
def test_nested_roles_outside_graph(session: Session) -> None:

    r = session.execute(select(Role).where(Role.name == "auditor")).scalar_one()
    assert r.name == "auditor"

    assert set(c.name for c in r.capabilities) == {"observe"}
    assert len(r.capabilities) == 1
