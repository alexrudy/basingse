import dataclasses as dc

from flask import Blueprint
from flask import Flask

from . import admin  # noqa: F401
from basingse.utils.settings import BlueprintOptions


@dc.dataclass(frozen=True)
class PageSettings:
    blueprint: BlueprintOptions = BlueprintOptions()

    def init_app(self, app: Flask | Blueprint) -> None:
        from .views import bp

        app.register_blueprint(bp, **dc.asdict(self.blueprint))
