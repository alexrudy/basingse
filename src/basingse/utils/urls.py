from urllib.parse import urlencode

from flask import Request
from flask import url_for


def rewrite_url(request: Request, **kwargs: str) -> str:
    args = dict(**request.args)
    args.update(kwargs)
    return f"{request.base_url}?{urlencode(args)}"


def rewrite_endpoint(request: Request, **kwargs: str) -> str:
    assert request.endpoint is not None, "Request has no endpoint."
    return rewrite_update(request, request.endpoint, **kwargs)


def rewrite_update(request: Request, endpoint: str, **kwargs: str) -> str:
    if request.view_args:
        args = dict(**request.view_args)
    else:
        args = dict()
    args.update(request.args)
    args.update(kwargs)
    return url_for(endpoint, **args)
