import dataclasses as dc

from flask import Flask

from basingse.utils.settings import BlueprintOptions


@dc.dataclass(frozen=True)
class CustomizeSettings:
    blueprint: BlueprintOptions = BlueprintOptions()
    admin: BlueprintOptions | None = BlueprintOptions()

    def init_app(self, app: Flask) -> None:
        from .views import bp, home
        from . import services
        from . import cli

        app.register_blueprint(bp, **dc.asdict(self.blueprint))
        services.init_app(app)
        cli.init_app(app)

        app.add_url_rule("/", "home", home)

        if self.admin is not None:
            from .admin.views import init_app

            init_app(app, self.admin)
