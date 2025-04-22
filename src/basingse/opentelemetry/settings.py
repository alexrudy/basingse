import dataclasses as dc
import importlib.metadata
from typing import TYPE_CHECKING
from typing import TypedDict

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
from basingse.utils.once import once

if TYPE_CHECKING:
    from opentelemetry.sdk.trace.export import SpanExporter


class MetricsSettings(TypedDict):
    system: bool
    console: bool


class OTLPSettings(TypedDict):
    http: str | None
    grpc: str | None


class TracingSettings(TypedDict):
    otlp: OTLPSettings | None
    console: bool


@once
def init_trace_provider(resource: Resource, otlp: OTLPSettings | None = None, console: bool = True) -> TracerProvider:
    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)

    if console:
        span_processor = BatchSpanProcessor(RichConsoleSpanExporter())
        provider.add_span_processor(span_processor)

    if otlp:
        otlp_exporter: SpanExporter | None = None
        if otlp.get("http"):
            otlp_exporter = OTLPHTTPSpanExporter(endpoint=otlp["http"])
        elif otlp.get("grpc"):
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
    metrics: MetricsSettings = dc.field(default_factory=lambda: MetricsSettings({"system": True, "console": False}))
    tracing: TracingSettings = dc.field(
        default_factory=lambda: TracingSettings(
            {
                "otlp": None,
                "console": True,
            }
        )
    )

    def init_app(self, app: Flask) -> None:
        self.init_tracing(app)
        self.init_metrics(app)

    def init_tracing(self, app: Flask) -> None:
        resource = Resource(attributes=attributes(app))
        init_trace_provider(resource=resource, **self.tracing)
        FlaskInstrumentor().instrument_app(app)

        registry = svcs.get_registry(app)
        service = registry.get_registered_service_for(Engine)
        if service:
            SQLAlchemyInstrumentor().instrument(engine=service.factory())

    def init_metrics(self, app: Flask) -> None:
        init_metrics_provider(**self.metrics)
