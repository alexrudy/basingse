import dataclasses as dc
from collections.abc import Iterator
from typing import Any

import pytest
from flask import Flask
from jinja2 import Template


@dc.dataclass
class TemplateRendered:
    template: Template
    context: dict[str, Any]


class TemplatesFixture:
    def __init__(self) -> None:
        self.templates: list[TemplateRendered] = []

    def template_rendered(self, app: Flask, template: Template, context: dict[str, Any], **extra: Any) -> None:
        self.templates.append(TemplateRendered(template, context))

    def __getitem__(self, index: int) -> TemplateRendered:
        return self.templates[index]

    def __len__(self) -> int:
        return len(self.templates)


@pytest.fixture
def templates() -> Iterator[TemplatesFixture]:
    from flask import template_rendered

    fixture = TemplatesFixture()

    template_rendered.connect(fixture.template_rendered)

    yield fixture

    template_rendered.disconnect(fixture.template_rendered)
