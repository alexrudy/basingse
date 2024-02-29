import dataclasses as dc


@dc.dataclass(frozen=True)
class BlueprintOptions:
    namespace: str | None = None
    url_prefix: str | None = None
    template_folder: str = "templates"
