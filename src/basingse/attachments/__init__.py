from flask_attachments import Attachments
from flask_attachments.extension import settings
from flask_attachments.models import Attachment

from .views import AttachmentsAdmin

__all__ = ["settings", "AttachmentsAdmin", "Attachment", "Attachments"]
