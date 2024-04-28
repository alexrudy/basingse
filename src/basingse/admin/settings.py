import dataclasses as dc

from flask import Flask

from .extension import Portal
from .views import portal
from basingse import svcs
from basingse.utils.settings import BlueprintOptions


@dc.dataclass(frozen=True)
class AdminSettings:
    blueprint: BlueprintOptions = BlueprintOptions()

    def init_app(self, app: Flask) -> None:
        svcs.register_factory(app, Portal, lambda: portal)

        app.register_blueprint(portal, **dc.asdict(self.blueprint))
