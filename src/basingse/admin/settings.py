import dataclasses as dc

from basingse.utils.settings import BlueprintOptions
from flask import Blueprint
from flask import Flask

from .extension import AdminView
from .views import bp


@dc.dataclass(frozen=True)
class AdminSettings:
    blueprint: BlueprintOptions = BlueprintOptions()

    def init_app(self, app: Flask | Blueprint) -> None:
        app.register_blueprint(bp, **dc.asdict(self.blueprint))
        app.cli.add_command(AdminView.importer_group)
