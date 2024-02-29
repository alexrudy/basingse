from basingse.forms import Form
from basingse.forms import SLUG_VALIDATOR
from wtforms import StringField
from wtforms import SubmitField
from wtforms.validators import DataRequired


class PageEditForm(Form):
    title = StringField("Title", validators=[DataRequired()])
    slug = StringField("Slug", validators=[DataRequired(), SLUG_VALIDATOR])

    content = StringField("Content", validators=[DataRequired()])

    submit = SubmitField("Save")
