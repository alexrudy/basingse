import dataclasses as dc

from flask import Blueprint
from flask import Flask

core = Blueprint("basingse", __name__, template_folder="templates", static_folder="static")


@dc.dataclass(frozen=True)
class CoreSettings:
    def init_app(self, app: Flask) -> None:
        app.register_blueprint(core)
