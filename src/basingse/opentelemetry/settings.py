import dataclasses as dc
import functools
import importlib.metadata
from collections.abc import Callable
from typing import Generic
from typing import ParamSpec
from typing import TypedDict
from typing import TypeVar

import httpx  # noqa: F401
from flask import Flask
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter as OTLPGRPCSpanExporter
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter as OTLPHTTPSpanExporter
from opentelemetry.exporter.richconsole import RichConsoleSpanExporter
from opentelemetry.instrumentation.flask import FlaskInstrumentor
from opentelemetry.instrumentation.httpx import HTTPXClientInstrumentor
from opentelemetry.instrumentation.jinja2 import Jinja2Instrumentor
from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor
from opentelemetry.instrumentation.system_metrics import SystemMetricsInstrumentor
from opentelemetry.metrics import set_meter_provider
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import ConsoleMetricExporter
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from sqlalchemy.engine import Engine

from basingse import svcs


class MetricsSettings(TypedDict):
    system: bool
    console: bool


class OTLPSettings(TypedDict):
    http: str | None
    grpc: str | None


class TracingSettings(TypedDict):
    otlp: OTLPSettings | None
    console: bool


class NotInitialized:

    def __repr__(self) -> str:
        return "NotInitialized"


not_initialized = NotInitialized()

P = ParamSpec("P")
R = TypeVar("R")


class Once(Generic[P, R]):

    def __init__(self, f: Callable[P, R]) -> None:
        self._inner = f
        functools.wraps(f)(self)
        self._result = not_initialized

    def __call__(self, *args: P.args, **kwargs: P.kwargs) -> R:
        if self._result is not_initialized:
            self._result = self._inner(*args, **kwargs)
        assert not isinstance(self._result, NotInitialized), "Function should be called at least once"
        return self._result


def once(f: Callable[P, R]) -> Once[P, R]:
    return Once(f)


@once
def init_trace_provider(resource: Resource, otlp: OTLPSettings | None = None, console: bool = True) -> TracerProvider:
    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)

    if console:
        span_processor = BatchSpanProcessor(RichConsoleSpanExporter())
        provider.add_span_processor(span_processor)

    if otlp:
        otlp_exporter = None
        if otlp.get("http"):
            print(f"configuring with otlp/http {otlp['http']}")
            otlp_exporter = OTLPHTTPSpanExporter(endpoint=otlp["http"])
        elif otlp.get("grpc"):
            print(f"configuring with otlp/grpc {otlp['grpc']}")
            otlp_exporter = OTLPGRPCSpanExporter(endpoint=otlp["grpc"])
        if otlp_exporter:
            span_processor = BatchSpanProcessor(otlp_exporter)
            provider.add_span_processor(span_processor)

    HTTPXClientInstrumentor().instrument()
    Jinja2Instrumentor().instrument()

    return provider


@once
def init_metrics_provider(system: bool = True, console: bool = True) -> MeterProvider:
    exporters = []
    if console:
        exporter = ConsoleMetricExporter()
        exporters.append(PeriodicExportingMetricReader(exporter=exporter))
    meter_provider = MeterProvider(exporters)
    set_meter_provider(meter_provider)

    if system:
        SystemMetricsInstrumentor().instrument()
    return meter_provider


def attributes(app: Flask) -> dict[str, str]:
    attrs = {
        "service.name": app.name,
        "deployment.environment.name": app.config.get("ENV", "development"),
    }

    try:
        attrs["service.version"] = importlib.metadata.version(app.import_name)
    except importlib.metadata.PackageNotFoundError:
        pass

    return attrs


@dc.dataclass
class OpenTelemetry:

    metrics: MetricsSettings = dc.field(default_factory=lambda: {"system": True, "console": False})
    tracing: TracingSettings = dc.field(
        default_factory=lambda: {
            "otlp": None,
            "console": True,
        }
    )

    def init_app(self, app: Flask) -> None:
        self.init_tracing(app)
        self.init_metrics(app)

    def init_tracing(self, app: Flask) -> None:
        print(f"configuring with {self.tracing}")
        resource = Resource(attributes=attributes(app))
        init_trace_provider(resource=resource, **self.tracing)
        FlaskInstrumentor().instrument_app(app)

        registry = svcs.get_registry(app)
        service = registry.get_registered_service_for(Engine)
        if service:
            SQLAlchemyInstrumentor().instrument(engine=service.factory())

    def init_metrics(self, app: Flask) -> None:
        init_metrics_provider(**self.metrics)
