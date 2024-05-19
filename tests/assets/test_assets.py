import hashlib
import json
import re
from pathlib import Path

import pytest
import werkzeug.exceptions
from flask import Flask
from flask.testing import FlaskClient

from basingse import svcs
from basingse.assets import AssetLocation
from basingse.assets import AssetManifest
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
def collection(tmp_path: Path) -> AssetManifest:
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

    return AssetManifest("fixture", location=AssetLocation(tmp_path))


@pytest.mark.parametrize(
    "postfix,expected", [("", Ok()), (".map", Ok()), (".invalid", NotFound())], ids=["asset", "map", "invalid"]
)
@pytest.mark.parametrize("filename", ["js/tests.main.js", "css/tests.main.css"], ids=["js", "css"])
@pytest.mark.parametrize("debug", [True, False], ids=["debug", "not_debug"])
def test_get(
    app: Flask,
    client: FlaskClient,
    debug: bool,
    collection: AssetManifest,
    filename: str,
    postfix: str,
    expected: Response,
) -> None:

    app.config["ASSETS_BUST_CACHE"] = not debug
    with app.app_context():
        assets = svcs.get(Assets)
        assets.append(collection)
        path = assets["fixture"].url(filename)

    with client.get(f"{path}{postfix}") as resp:
        assert resp == expected


@pytest.mark.usefixtures("app_context")
def test_iter_assets(collection: AssetManifest) -> None:
    assets = svcs.get(Assets)
    assets.append(collection)

    assert "js/tests.main.js" in [asset.filename for asset in assets.iter_assets("fixture", "js")]
    assert "css/tests.main.css" in [asset.filename for asset in assets.iter_assets("fixture")]


@pytest.mark.usefixtures("not_debug", "app_context")
def test_url_fallback(collection: AssetManifest) -> None:
    assets = svcs.get(Assets)
    assets.append(collection)
    with pytest.raises(KeyError):
        assets.url("fixture", "js/tests.other.js")


class TestCollection:

    @pytest.mark.usefixtures("app_context")
    def test_iter_assets(self, collection: AssetManifest) -> None:
        assert [asset.filename for asset in collection.iter_assets("js")] == ["js/tests.main.js"]
        assert [asset.filename for asset in collection.iter_assets("css")] == ["css/tests.main.css"]

    @pytest.mark.usefixtures("not_debug", "app_context")
    def test_url(self, app: Flask, collection: AssetManifest) -> None:
        assert (
            collection.url("js/tests.main.js")
            == "http://basingse.test/assets/fixture/js/tests.main.adf06cf637aff7c06810711225d7eec6.js"
        )

    def test_contains(self, collection: AssetManifest) -> None:
        assert "js/tests.main.js" in collection
        assert "css/tests.main.css" in collection
        assert "js/tests.other.js" not in collection

    @pytest.mark.usefixtures("not_debug", "app_context")
    def test_url_missing(self, collection: AssetManifest) -> None:
        with pytest.raises(KeyError):
            collection.url("js/tests.other.js")

    @pytest.mark.parametrize(
        "filename,found",
        [("js/tests.main.js", Ok()), ("css/tests.main.css", Ok())],
        ids=["js", "css"],
    )
    @pytest.mark.usefixtures("debug", "app_context")
    def test_response_debug_mode(self, app: Flask, collection: AssetManifest, filename: str, found: Response) -> None:
        with app.test_request_context():
            with app.make_response(collection.serve(filename)) as response:
                assert response == found
                assert response.get_etag() == (None, None)

    @pytest.mark.usefixtures("not_debug", "app_context")
    def test_response_not_found(self, app: Flask, collection: AssetManifest) -> None:
        with app.test_request_context(), pytest.raises(werkzeug.exceptions.NotFound):
            collection.serve("js/tests.other.js")

    @pytest.mark.parametrize(
        "filename,found",
        [("js/tests.main.js", Ok()), ("css/tests.main.css", Ok())],
        ids=["js", "css"],
    )
    @pytest.mark.usefixtures("not_debug", "app_context")
    def test_response_not_debug_mode(
        self, app: Flask, collection: AssetManifest, filename: str, found: Response
    ) -> None:
        with app.test_request_context():
            asset = collection[filename]
            with app.make_response(collection.serve(asset.filepath())) as response:
                assert response == Ok()


@pytest.mark.usefixtures("app_context", "not_debug")
def test_bundled_assets(app: Flask) -> None:

    assert app.config["ASSETS_BUST_CACHE"], "Cache should be busted"

    collection = AssetManifest("basingse", location=AssetLocation("basingse"))
    assert len(collection) > 0, "No assets found in basingse"

    some_asset = next(iter(collection.values()))

    with app.test_request_context():
        with app.make_response(collection.serve(some_asset.filepath())) as response:
            assert response == Ok()


def test_check_dist(capsys: pytest.CaptureFixture) -> None:

    check_dist()

    captured = capsys.readouterr()

    m = re.match(r"(\d+) asset files found", captured.out)
    assert m, "Expected asset files to be found"

    n_files = int(m.group(1))
    assert n_files > 0, "Expected at least one asset file"


def test_assets_delayed_init() -> None:
    app = Flask(__name__)
    svcs.init_app(app)
    assets = Assets()
    assets.init_app(app)
    assert any(app.url_map.iter_rules(endpoint="assets")), "No assets endpoint found"

    with app.app_context():
        assert svcs.get(Assets) == assets


def test_assets_direct_init() -> None:
    app = Flask(__name__)
    svcs.init_app(app)
    app.config["ASSETS_AUTORELOAD"] = False
    Assets(app=app)
    assert any(app.url_map.iter_rules(endpoint="assets")), "No assets endpoint found"
