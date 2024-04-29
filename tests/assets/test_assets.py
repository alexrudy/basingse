import hashlib
import json
import re
from pathlib import Path

import pytest
import werkzeug.exceptions
from flask import Flask
from flask.testing import FlaskClient

from basingse import svcs
from basingse.assets import AssetCollection
from basingse.assets import Assets
from basingse.assets import check_dist
from basingse.testing.responses import NotFound
from basingse.testing.responses import Ok
from basingse.testing.responses import Response


@pytest.fixture
def debug(app: Flask) -> None:
    app.config["ASSETS_BUST_CACHE"] = False


@pytest.fixture
def not_debug(app: Flask) -> None:
    app.config["ASSETS_BUST_CACHE"] = True


@pytest.fixture
def collection(tmp_path: Path) -> AssetCollection:
    manifest: dict[str, str] = {}

    def add_file(name: str, contents: str, map_contents: str) -> None:
        hash = hashlib.md5(contents.encode()).hexdigest()
        base, extension = name.rsplit(".", 1)

        (tmp_path / "assets" / extension).mkdir(exist_ok=True, parents=True)
        (tmp_path / "assets" / extension / f"{base}.{hash}.{extension}").write_text(contents)
        (tmp_path / "assets" / extension / f"{base}.{hash}.{extension}.map").write_text(map_contents)
        manifest[f"{extension}/{base}.{extension}"] = f"{extension}/{base}.{hash}.{extension}"
        manifest[f"{extension}/{base}.{extension}.map"] = f"{extension}/{base}.{hash}.{extension}.map"

    add_file("tests.main.js", "console.log('hello world');", "# sourceMappingURL=tests.main.js.map")
    add_file("tests.main.css", "body { background-color: red; }", "# sourceMappingURL=tests.main.css.map")

    (tmp_path / "assets" / "manifest.json").write_text(json.dumps(manifest))

    return AssetCollection(tmp_path, Path("manifest.json"), Path("assets"))


@pytest.mark.parametrize(
    "postfix,expected", [("", Ok()), (".map", Ok()), (".invalid", NotFound())], ids=["asset", "map", "invalid"]
)
@pytest.mark.parametrize("filename", ["js/tests.main.js", "css/tests.main.css"], ids=["js", "css"])
@pytest.mark.parametrize("debug", [True, False], ids=["debug", "not_debug"])
def test_get(
    app: Flask,
    client: FlaskClient,
    debug: bool,
    collection: AssetCollection,
    filename: str,
    postfix: str,
    expected: Response,
) -> None:

    app.config["ASSETS_BUST_CACHE"] = not debug
    with app.app_context():
        assets = svcs.get(Assets)
        assets.append(collection)
        path = assets.url(filename)

    with client.get(f"/bss/assets/{path}{postfix}") as resp:
        assert resp == expected


@pytest.mark.usefixtures("app_context")
def test_iter_assets(collection: AssetCollection) -> None:
    assets = svcs.get(Assets)
    assets.append(collection)

    assert "js/tests.main.js" in list(assets.iter_assets("js"))
    assert "css/tests.main.css" in list(assets.iter_assets(None))


@pytest.mark.usefixtures("not_debug", "app_context")
def test_url_fallback(collection: AssetCollection) -> None:
    assets = svcs.get(Assets)
    assets.append(collection)
    assert assets.url("js/tests.other.js") == "js/tests.other.js"


class TestCollection:

    def test_iter_assets(self, collection: AssetCollection) -> None:
        assert list(collection.iter_assets("js")) == ["js/tests.main.js"]
        assert list(collection.iter_assets("css")) == ["css/tests.main.css"]

    @pytest.mark.usefixtures("not_debug", "app_context")
    def test_url(self, app: Flask, collection: AssetCollection) -> None:
        assert collection.url("js/tests.main.js") == "js/tests.main.adf06cf637aff7c06810711225d7eec6.js"

    def test_contains(self, collection: AssetCollection) -> None:
        assert "js/tests.main.js" in collection
        assert "css/tests.main.css" in collection
        assert "js/tests.other.js" not in collection

    @pytest.mark.usefixtures("not_debug", "app_context")
    def test_url_missing(self, collection: AssetCollection) -> None:
        with pytest.raises(KeyError):
            collection.url("js/tests.other.js")

    @pytest.mark.usefixtures("debug", "app_context")
    def test_url_unknown(self, collection: AssetCollection) -> None:
        assert collection.url("js/tests.other.js") == "js/tests.other.js"

    @pytest.mark.parametrize(
        "filename,found",
        [("js/tests.main.js", Ok()), ("css/tests.main.css", Ok())],
        ids=["js", "css"],
    )
    @pytest.mark.usefixtures("debug", "app_context")
    def test_response_debug_mode(self, app: Flask, collection: AssetCollection, filename: str, found: Response) -> None:
        with app.test_request_context():
            with app.make_response(collection.serve_asset(filename)) as response:
                assert response == found  # type: ignore[comparison-overlap]
                assert response.get_etag() == (None, None)

    @pytest.mark.usefixtures("not_debug", "app_context")
    def test_response_not_found(self, app: Flask, collection: AssetCollection) -> None:
        with app.test_request_context(), pytest.raises(werkzeug.exceptions.NotFound):
            collection.serve_asset("js/tests.other.js")

    @pytest.mark.parametrize(
        "filename,found",
        [("js/tests.main.js", Ok()), ("css/tests.main.css", Ok())],
        ids=["js", "css"],
    )
    @pytest.mark.usefixtures("not_debug", "app_context")
    def test_response_not_debug_mode(
        self, app: Flask, collection: AssetCollection, filename: str, found: Response
    ) -> None:
        with app.test_request_context():
            url = collection.url(filename)

            with app.make_response(collection.serve_asset(url)) as response:
                assert response == Ok()
                etag, _ = response.get_etag()
                assert etag is not None


@pytest.mark.usefixtures("app_context", "not_debug")
def test_bundled_assets(app: Flask) -> None:

    assert app.config["ASSETS_BUST_CACHE"], "Cache should be busted"

    collection = AssetCollection("basingse", Path("manifest.json"), Path("assets"))
    assert len(collection) > 0, "No assets found in basingse"

    some_file = next(iter(collection))

    with app.test_request_context():
        url = collection.url(some_file)
        with app.make_response(collection.serve_asset(url)) as response:
            assert response == Ok()
            etag, _ = response.get_etag()

            # etag is not sent for importlib resources
            assert etag is None


def test_check_dist(capsys: pytest.CaptureFixture) -> None:

    check_dist()

    captured = capsys.readouterr()

    m = re.match(r"(\d+) asset files found", captured.out)
    assert m, "Expected asset files to be found"

    n_files = int(m.group(1))
    assert n_files > 0, "Expected at least one asset file"


def test_assets_no_blueprint(app: Flask) -> None:
    assets = Assets()
    assets.init_app(app)
    assert assets.blueprint is None
    assert any(app.url_map.iter_rules(endpoint="assets")), "No assets endpoint found"

    with app.app_context():
        assert svcs.get(Assets) == assets


def test_assets_direct_init(app: Flask) -> None:
    app.config["ASSETS_AUTORELOAD"] = False
    assets = Assets(app=app)
    assets.add_assets_folder("tests")
    assert assets.blueprint is None
    assert any(app.url_map.iter_rules(endpoint="assets")), "No assets endpoint found"

    with app.app_context():
        assert svcs.get(Assets) == assets
        assets.reload()
        assert assets.url("js/tests.bundled.js") == "js/tests.bundled.js"
