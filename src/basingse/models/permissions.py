from sqlalchemy import Column
from sqlalchemy import ForeignKey
from sqlalchemy import String
from sqlalchemy.orm import relationship

from .base import Model
from .types import GUID


class Capability(Model):
    name = Column(String, nullable=False, help="Identifier for this capability")
    description = Column(String, nullable=True, help="Description of this capability")


class Role(Model):
    name = Column(String, nullable=False, help="Identifier for this role")
    description = Column(String, nullable=True, help="Description of this role")

    direct_capabilities: set[Capability] = relationship(
        "Capability", secondary="auth.rolecapabilityassociations", collection_class=set
    )
    contained_roles: set["Role"] = relationship(
        "Role",
        secondary="auth.rollrollassociations",
        collection_class=set,
        primaryjoin="Role.id == RollRollAssociation.parent_role_id",
        secondaryjoin="Role.id == RollRollAssociation.child_role_id",
        cascade="all",
    )


class RollCapabilityAssociation(Model):
    role_id = Column(GUID(), ForeignKey("auth.roles.id", ondelete="CASCADE"), nullable=False)
    capability_id = Column(GUID(), ForeignKey("auth.capabilities.id", ondelete="CASCADE"), nullable=False)


class RollRollAssociation(Model):
    parent_role_id = Column(GUID(), ForeignKey("auth.roles.id", ondelete="CASCADE"), nullable=False)
    child_role_id = Column(GUID(), ForeignKey("auth.roles.id", ondelete="CASCADE"), nullable=False)
