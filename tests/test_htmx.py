from basingse.htmx import HtmxProperties


def test_htmx_attrs() -> None:

    properties = HtmxProperties({"get": "/api", "do": "post"})
    assert properties.attrs == {"hx-get": "/api", "hx-do": "post"}
    assert str(properties) == "hx-get=/api hx-do=post"
