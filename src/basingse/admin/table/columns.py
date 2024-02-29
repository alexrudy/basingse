import attrs
from basingse.admin.table.base import ColumnBase
from basingse.admin.table.base import maybe
from jinja2 import Template


@attrs.define
class Column(ColumnBase):
    template = attrs.field(converter=maybe(Template))  # type: ignore

    @template.default
    def default_template(self) -> Template:
        return Template(source="{{ item }}")


@attrs.define
class EditColumn(ColumnBase):

    template = attrs.field(converter=maybe(Template))  # type: ignore

    @template.default
    def default_template(self) -> Template:
        return Template(source="<a href='{{ url_for(\".edit\", id=id) }}'>{{ item }}</a>")


@attrs.define
class CheckColumn(ColumnBase):

    template = attrs.field(converter=maybe(Template))  # type: ignore

    @template.default
    def default_template(self) -> Template:
        return Template(
            source="{% if item %}{{ icon('check', classes='text-success') }}{% else %}"
            "{{ icon('x', classes='text-danger')}}{% endif %}",
        )


@attrs.define
class Datetime(ColumnBase):

    template = attrs.field(converter=maybe(Template))  # type: ignore

    @template.default
    def default_template(self) -> Template:
        return Template(
            source="""{% if item %}<span class="datetime">{{ item.isoformat() }}</span>{% else %}never{% endif %}"""
        )
