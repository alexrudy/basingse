from collections.abc import Iterable
from typing import Any

from flask_wtf import FlaskForm
from markupsafe import Markup
from sqlalchemy import select
from wtforms import BooleanField
from wtforms import EmailField
from wtforms import PasswordField
from wtforms import StringField
from wtforms import SubmitField
from wtforms import widgets
from wtforms.fields import Field
from wtforms.validators import DataRequired
from wtforms.validators import Email
from wtforms.validators import EqualTo
from wtforms.validators import Length
from wtforms.validators import Optional
from wtforms.widgets import html_params
from wtforms_sqlalchemy.fields import QueryCheckboxField

from .permissions import Role
from basingse import svcs
from basingse.models import Session

PASSWORD_MINIMUM_LENGTH = 6
PASSWORD_VALIDATOR = Length(
    min=PASSWORD_MINIMUM_LENGTH, message=f"Passwords must be at least {PASSWORD_MINIMUM_LENGTH} characters long"
)


class LoginForm(FlaskForm):
    """Used to handle login actions to the website."""

    email = StringField("Email", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])
    remember_me = BooleanField("Remember Me")
    submit = SubmitField("Sign In")


class ChangePasswordForm(FlaskForm):
    """Used to handle changing a password"""

    old_password = PasswordField("Current Password", validators=[DataRequired()])
    new_password = PasswordField(
        "New Password",
        validators=[DataRequired(), PASSWORD_VALIDATOR],
    )
    confirm = PasswordField(
        "Confirm new Password", validators=[DataRequired(), EqualTo("new_password", message="Passwords must match")]
    )
    submit = SubmitField("Submit")


class MaybePasswordField(PasswordField):
    def process_formdata(self, values: list[str]) -> list[Any]:
        values = [value if value.strip() else None for value in values]
        return super().process_formdata(values)


def get_query_roles() -> Iterable[Role]:
    session = svcs.get(Session)
    return session.scalars(select(Role))


class BSListWidget(widgets.ListWidget):

    def __init__(self, prefix_label: bool = False) -> None:
        self.ul_class = "list-group"
        super().__init__(prefix_label=prefix_label)

    def __call__(self, field: Field, **kwargs: Any) -> Markup:
        kwargs.setdefault("id", field.id)
        kwargs.setdefault("class_", self.ul_class)

        html = [f"<{self.html_tag} {html_params(**kwargs)}>"]
        subelement_params = {"class": "list-group-item"}
        subfield_params = {"class": "form-check-input"}
        subfield_label_params = {"class": "form-check-label"}
        for subfield in field:
            if self.prefix_label:
                html.append(
                    f"<li {html_params(**subelement_params)}>{subfield.label(**subfield_label_params)} "
                    f"{subfield(**subfield_params)}</li>"
                )
            else:
                html.append(
                    f"<li {html_params(**subelement_params)}>{subfield(**subfield_params)} "
                    f"{subfield.label(**subfield_label_params)}</li>"
                )
        html.append("</%s>" % self.html_tag)
        return Markup("".join(html))


class UserEditForm(FlaskForm):
    username = StringField("Username")
    email = EmailField("Email", validators=[DataRequired(), Email(granular_message=True)])
    password = MaybePasswordField(
        "Set New Password",
        validators=[Optional(), PASSWORD_VALIDATOR],
        description="Leave blank to keep the current password",
    )

    roles = QueryCheckboxField(
        "Roles",
        get_label="name",
        query_factory=get_query_roles,
        widget=BSListWidget(prefix_label=False),
    )

    active = BooleanField("Active")
    submit = SubmitField("Save")
