from pathlib import Path

import pytest
import yaml
from flask import Flask
from sqlalchemy import select
from sqlalchemy.orm import Session

from .conftest import FakePost
from basingse import svcs
from basingse.admin.portal import import_all
from basingse.admin.portal import Portal
from basingse.testing.cli import Success


@pytest.mark.usefixtures("adminview", "post")
class TestImports:
    @pytest.fixture
    def yml(self) -> Path:
        return Path(__file__).parent / "data"

    def test_all(self, app: Flask, yml: Path) -> None:
        runner = app.test_cli_runner()
        result = runner.invoke(import_all, [str(yml / "post.yml")])

        assert result == Success()

        with app.app_context():
            session = svcs.get(Session)
            post = session.scalar(select(FakePost).where(FakePost.title == "Balls and Strikes"))
            assert post is not None
            assert post.content.strip() == "This post is not about the supreme court."

    def test_model(self, app: Flask, portal: Portal, yml: Path) -> None:
        runner = app.test_cli_runner()
        result = runner.invoke(portal.importer_group, ["post", str(yml / "post.yml")])
        assert result == Success()

        with app.app_context():
            session = svcs.get(Session)
            post = session.scalar(select(FakePost).where(FakePost.title == "The second post"))
            assert post is not None
            assert post.content.strip() == "Some content which goes in the second post"

    def test_model_clear(self, app: Flask, portal: Portal, yml: Path, post: FakePost) -> None:
        runner = app.test_cli_runner()
        result = runner.invoke(portal.importer_group, ["post", "--clear", str(yml / "post.yml")])
        assert result == Success()

        with app.app_context():
            session = svcs.get(Session)
            new_post = session.scalar(select(FakePost).where(FakePost.title == "The second post"))
            assert new_post is not None
            assert new_post.content.strip() == "Some content which goes in the second post"

            other = session.scalar(select(FakePost).where(FakePost.id == post.id))
            assert other is None, "Post was not cleared"

    def test_model_alternate_key(self, app: Flask, portal: Portal, yml: Path) -> None:
        runner = app.test_cli_runner()
        result = runner.invoke(
            portal.importer_group,
            ["post", str(yml / "post.yml"), "--data-key", "alternate"],
        )
        assert result == Success()

        with app.app_context():
            session = svcs.get(Session)
            post = session.scalar(select(FakePost).where(FakePost.title == "Five is way too many"))
            assert post is not None
            assert post.content.strip() == "This post is out of line."

    def test_scalar(self, app: Flask, portal: Portal, yml: Path) -> None:
        runner = app.test_cli_runner()
        result = runner.invoke(portal.importer_group, ["post", str(yml / "post-scalar.yml")])
        assert result == Success()

        with app.app_context():
            session = svcs.get(Session)
            post = session.scalar(select(FakePost).where(FakePost.title == "The fourth post"))
            assert post is not None
            assert post.content.strip() == "May the fourth be with you"


@pytest.mark.usefixtures("adminview", "post")
class TestExports:
    def test_all(self, app: Flask, portal: Portal, tmp_path: Path) -> None:
        where = tmp_path / "all.yml"
        runner = app.test_cli_runner(mix_stderr=False)
        result = runner.invoke(portal.exporter_group, ["all", str(where)], catch_exceptions=False)

        assert result == Success()

        with where.open("r") as stream:
            data = yaml.safe_load(stream)
        assert len(data.get("post", [])) == 1

    def test_model(self, app: Flask, portal: Portal, tmp_path: Path) -> None:
        runner = app.test_cli_runner(mix_stderr=False)
        where = tmp_path / "post.yml"
        result = runner.invoke(portal.exporter_group, ["post", str(where)])
        assert result == Success()

        with where.open("r") as stream:
            data = yaml.safe_load(stream)
        assert len(data.get("post", [])) == 1
