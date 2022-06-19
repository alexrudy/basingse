from cached_property import cached_property
from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import select
from sqlalchemy import String
from sqlalchemy.orm import aliased
from sqlalchemy.orm import relationship
from sqlalchemy.orm import object_session
from sqlalchemy.orm import Session
from sqlalchemy.sql import Select

from .base import Model
from .types import GUID


class Capability(Model):

    __tablename__ = "capabilities"  # type: ignore

    name = Column(String, nullable=False, doc="Identifier for this capability")
    description = Column(String, nullable=True, doc="Description of this capability")


def role_capability_association() -> Select:

    leaves = aliased(Role, name="role_leaves")
    parent = aliased(RoleRoleAssociation, name="role_roots")
    child = aliased(RoleRoleAssociation, name="role_children")

    roles = (
        select([parent.parent_role_id.label("parent_id"), parent.child_role_id.label("child_id")])
        .union(select([leaves.id.label("parent_id"), leaves.id.label("child_id")]))
        .cte()
    )

    role_heirarchy = select([roles]).cte(recursive=True, name="role_heirarchy")
    role_heirarchy = role_heirarchy.union(
        select([role_heirarchy.c.parent_id.label("parent_id"), child.child_role_id.label("child_id")]).where(
            child.parent_role_id == role_heirarchy.c.child_id
        )
    )

    capability_mapping = (
        select(
            [
                Role.id.label("role_id"),
                RoleCapabilityAssociation.capability_id.label("capability_id"),
            ]
        )
        .join(role_heirarchy, Role.id == role_heirarchy.c.parent_id)
        .join(RoleCapabilityAssociation, role_heirarchy.c.child_id == RoleCapabilityAssociation.role_id)
    )

    return capability_mapping


class Role(Model):
    name = Column(String, nullable=False, doc="Identifier for this role")
    description = Column(String, nullable=True, doc="Description of this role")

    direct_capabilities: set[Capability] = relationship(
        "Capability", secondary="auth.rolecapabilityassociations", collection_class=set
    )
    contained_roles: set["Role"] = relationship(
        "Role",
        secondary="auth.roleroleassociations",
        collection_class=set,
        primaryjoin="Role.id == RoleRoleAssociation.parent_role_id",
        secondaryjoin="Role.id == RoleRoleAssociation.child_role_id",
        cascade="all",
    )

    @cached_property
    def capabilities(self) -> frozenset[Capability]:
        src = role_capability_association().cte()
        session = object_session(self)
        assert isinstance(session, Session), "Expected ORM Session"
        stmt = select(Capability).join(src, src.c.capability_id == Capability.id).where(src.c.role_id == self.id)
        return frozenset(session.execute(stmt).scalars())


class RoleCapabilityAssociation(Model):
    role_id = Column(GUID(), ForeignKey("auth.roles.id", ondelete="CASCADE"), nullable=False)
    capability_id = Column(GUID(), ForeignKey("auth.capabilities.id", ondelete="CASCADE"), nullable=False)


class RoleRoleAssociation(Model):
    parent_role_id = Column(GUID(), ForeignKey("auth.roles.id", ondelete="CASCADE"), nullable=False)
    child_role_id = Column(GUID(), ForeignKey("auth.roles.id", ondelete="CASCADE"), nullable=False)


class RoleUserAssociation(Model):
    role_id = Column(GUID(), ForeignKey("auth.roles.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(GUID(), ForeignKey("auth.users.id", ondelete="CASCADE"), nullable=False)


class RoleAuthenticationAssociation(Model):
    role_id = Column(GUID(), ForeignKey("auth.roles.id", ondelete="CASCADE"), nullable=False)
    authentication_id = Column(GUID(), ForeignKey("auth.authentications.id", ondelete="CASCADE"), nullable=False)
