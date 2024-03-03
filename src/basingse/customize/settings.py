import dataclasses as dc

from flask import Flask

from basingse.utils.settings import BlueprintOptions


@dc.dataclass(frozen=True)
class CustomizeSettings:
    blueprint: BlueprintOptions = BlueprintOptions()

    def init_app(self, app: Flask) -> None:
        from .views import bp
        from . import services
        from . import cli

        app.register_blueprint(bp, **dc.asdict(self.blueprint))
        services.init_app(app)
        cli.init_app(app)
