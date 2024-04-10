import dataclasses as dc

from flask import Blueprint
from flask import Flask

from .extension import AdminView
from .views import portal
from basingse.utils.settings import BlueprintOptions


@dc.dataclass(frozen=True)
class AdminSettings:
    blueprint: BlueprintOptions = BlueprintOptions()

    def init_app(self, app: Flask | Blueprint) -> None:
        app.register_blueprint(portal, **dc.asdict(self.blueprint))
        app.cli.add_command(AdminView.importer_group)
        app.cli.add_command(AdminView.exporter_group)
