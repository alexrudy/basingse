import dataclasses as dc

from flask import Blueprint
from flask import Flask

from . import admin  # noqa: F401
from basingse.utils.settings import BlueprintOptions


@dc.dataclass(frozen=True)
class PageSettings:
    blueprint: BlueprintOptions = BlueprintOptions()
    markdown: bool = False

    def init_app(self, app: Flask | Blueprint) -> None:
        from .views import bp

        def markdown_in_context() -> bool:
            return self.markdown

        if isinstance(app, Flask):
            app.add_template_global(markdown_in_context, "use_markdown_in_page")
        else:
            app.add_app_template_global(markdown_in_context, "use_markdown_in_page")

        app.register_blueprint(bp, **dc.asdict(self.blueprint))
