from flask import Flask


def init_app(app: Flask) -> None:
    from .views import bp
    from .extension import AdminView

    app.register_blueprint(bp)
    app.cli.add_command(AdminView.importer_group)
