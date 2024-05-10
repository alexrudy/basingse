import enum
from typing import Any
from typing import TYPE_CHECKING
from uuid import UUID

from bootlace.table.columns import CheckColumn
from bootlace.table.columns import Column
from flask import url_for
from flask_attachments import Attachment
from sqlalchemy import Boolean
from sqlalchemy import ForeignKey
from sqlalchemy import Integer
from sqlalchemy import String
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from basingse.models import Model
from basingse.models import orm

if TYPE_CHECKING:
    from basingse.page.models import Page  # noqa: F401


class LogoSize(enum.Enum):
    """Logo sizes"""

    SMALL = enum.auto()
    LARGE = enum.auto()
    TEXT = enum.auto()
    FAVICON = enum.auto()


class Logo(Model):
    """Represents the options for a site's logo"""

    small_id: Mapped[UUID] = mapped_column(
        Uuid(), ForeignKey("attachments.attachment.id", ondelete="SET NULL"), nullable=True
    )
    small = relationship(
        "Attachment", uselist=False, foreign_keys=[small_id], primaryjoin=Attachment.id == small_id, lazy="joined"
    )

    large_id: Mapped[UUID] = mapped_column(
        Uuid(), ForeignKey("attachments.attachment.id", ondelete="SET NULL"), nullable=True
    )
    large = relationship(
        "Attachment", uselist=False, foreign_keys=[large_id], primaryjoin=Attachment.id == large_id, lazy="joined"
    )

    text_id: Mapped[UUID] = mapped_column(
        Uuid(), ForeignKey("attachments.attachment.id", ondelete="SET NULL"), nullable=True
    )
    text = relationship(
        "Attachment", uselist=False, foreign_keys=[text_id], primaryjoin=Attachment.id == text_id, lazy="joined"
    )

    favicon_id: Mapped[UUID] = mapped_column(
        Uuid(), ForeignKey("attachments.attachment.id", ondelete="SET NULL"), nullable=True
    )
    favicon = relationship(
        "Attachment", uselist=False, foreign_keys=[favicon_id], primaryjoin=Attachment.id == favicon_id, lazy="joined"
    )

    alt_text: Mapped[str] = mapped_column(String(), nullable=True, doc="Alt text for logo")

    def has_text_logo(self) -> bool:
        """Does this logo have a text logo?"""
        return self.text is not None

    def size(self, size: LogoSize) -> Attachment | None:
        """Get the best-fit logo link for a given size"""

        # Exact match
        if size == LogoSize.SMALL and self.small is not None:
            return self.small
        elif size == LogoSize.LARGE and self.large is not None:
            return self.large
        elif size == LogoSize.TEXT and self.text is not None:
            return self.text
        elif size == LogoSize.FAVICON and self.favicon is not None:
            return self.favicon

        # Fallbacks
        if size in (LogoSize.SMALL, LogoSize.TEXT) and self.large is not None:
            return self.large
        elif size in (LogoSize.LARGE, LogoSize.TEXT) and self.small is not None:
            return self.small

        return None

    def set_size(self, size: LogoSize, attachment: Attachment) -> None:
        """Set the attachment for a given size"""
        if size == LogoSize.SMALL:
            self.small = attachment
        elif size == LogoSize.LARGE:
            self.large = attachment
        elif size == LogoSize.TEXT:
            self.text = attachment
        elif size == LogoSize.FAVICON:
            self.favicon = attachment

    def link(self, size: LogoSize) -> str | None:
        """Get the best-fit logo link for a given size"""

        attachment = self.size(size)
        if attachment is not None:
            return attachment.link
        return None


class SiteSettings(Model):
    """
    Common global settings
    """

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        if not isinstance(self.logo, Logo):
            self.logo = Logo()
        self._links: list[SocialLink] = []

    # TODO: Constrian global settings to be a single row
    active: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        doc="Is this site active?",
        info=orm.info(schema=orm.auto(), form=orm.auto(), listview=CheckColumn("Active")),
    )

    logo_id: Mapped[UUID] = mapped_column(Uuid(), ForeignKey("logos.id", ondelete="SET NULL"), nullable=True)
    logo = relationship(
        "Logo",
        uselist=False,
        foreign_keys=[logo_id],
        lazy="joined",
        info=orm.info(schema=orm.auto(), listview=CheckColumn("Logo")),
    )

    title: Mapped[str] = mapped_column(
        String(),
        nullable=True,
        doc="Site title",
        info=orm.info(schema=orm.auto(), form=orm.auto(), listview=Column("Title")),
    )
    subtitle: Mapped[str] = mapped_column(String(), nullable=True, doc="Site subtitle")

    homepage_id: Mapped[UUID] = mapped_column(Uuid(), ForeignKey("pages.id"), nullable=True)
    homepage: Mapped["Page"] = relationship("Page", uselist=False, foreign_keys=[homepage_id], lazy="selectin")

    contactpage_id: Mapped[UUID] = mapped_column(Uuid(), ForeignKey("pages.id"), nullable=True)
    contactpage: Mapped["Page"] = relationship("Page", uselist=False, foreign_keys=[contactpage_id], lazy="selectin")
    contact_message: Mapped[str] = mapped_column(
        String(), nullable=True, doc="What to say on the contacts", default="Collaborate"
    )

    footer_message: Mapped[str] = mapped_column(String(), nullable=True, doc="Footer message")

    links = relationship("SocialLink", lazy="selectin", back_populates="site")


class SocialLink(Model):
    """
    Social links
    """

    site_id = mapped_column(Uuid(), ForeignKey("site_settingss.id", ondelete="CASCADE"), nullable=False)
    site = relationship("SiteSettings", uselist=False, foreign_keys=[site_id], lazy="joined", back_populates="links")

    order: Mapped[int] = mapped_column(
        Integer, nullable=True, doc="Social link order on homepage", info=orm.info(schema=orm.auto())
    )
    name: Mapped[str] = mapped_column(
        String(),
        nullable=True,
        doc="Social link name",
        info=orm.info(schema=orm.auto(), form=orm.auto(), listview=orm.auto()),
    )
    _url = mapped_column(
        "url",
        String(),
        nullable=True,
        doc="Social link url",
        info=orm.info(schema=orm.auto(), form=orm.auto(), listview=orm.auto()),
    )
    icon: Mapped[str] = mapped_column(
        String(),
        nullable=True,
        doc="Social link icon name from bootstrap icons",
        info=orm.info(schema=orm.auto(), form=orm.auto(), listview=orm.auto()),
    )
    image_id: Mapped[UUID] = mapped_column(Uuid(), nullable=True)
    image = relationship(
        "Attachment", uselist=False, foreign_keys=[image_id], primaryjoin=Attachment.id == image_id, lazy="joined"
    )

    @property
    def url(self) -> str:
        """Get the URL for this social link"""
        if self._url is None:
            return ""
        if self._url.startswith("http"):
            return self._url
        if "/" in self._url:
            return self._url
        return url_for(self._url)

    @url.setter
    def url(self, value: str) -> None:
        self._url = value
