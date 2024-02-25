from typing import Any

from flask_wtf import FlaskForm
from wtforms import BooleanField
from wtforms import EmailField
from wtforms import PasswordField
from wtforms import StringField
from wtforms import SubmitField
from wtforms.validators import DataRequired
from wtforms.validators import Email
from wtforms.validators import EqualTo
from wtforms.validators import Length
from wtforms.validators import Optional

PASSWORD_MINIMUM_LENGTH = 6
PASSWORD_VALIDATOR = Length(
    min=PASSWORD_MINIMUM_LENGTH, message=f"Passwords must be at least {PASSWORD_MINIMUM_LENGTH} characters long"
)


class LoginForm(FlaskForm):  # type: ignore
    """Used to handle login actions to the website."""

    email = StringField("Email", validators=[DataRequired()])
    password = PasswordField("Password", validators=[DataRequired()])
    remember_me = BooleanField("Remember Me")
    submit = SubmitField("Sign In")


class ChangePasswordForm(FlaskForm):  # type: ignore
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


class MaybePasswordField(PasswordField):  # type: ignore
    def process_formdata(self, values: list[str]) -> list[Any]:
        values = [value if value.strip() else None for value in values]
        return super().process_formdata(values)


class UserEditForm(FlaskForm):  # type: ignore
    username = StringField("Username")
    email = EmailField("Email", validators=[DataRequired(), Email(granular_message=True)])
    password = MaybePasswordField(
        "Set New Password",
        validators=[Optional(), PASSWORD_VALIDATOR],
    )

    active = BooleanField("Active")
    submit = SubmitField("Save")
