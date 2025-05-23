import contextlib
import dataclasses as dc
import logging
import queue
import subprocess
import threading
import time
from collections.abc import Iterator
from pathlib import Path
from typing import Protocol
from typing import TypeVar

import click
import structlog
from flask import Flask
from flask_socketio import SocketIO
from watchdog.events import FileSystemEvent
from watchdog.events import PatternMatchingEventHandler
from watchdog.observers import Observer


logger = structlog.get_logger()


class Stoppable(Protocol):
    def stop(self) -> None: ...
    def join(self) -> None: ...


S = TypeVar("S", bound=Stoppable)


@contextlib.contextmanager
def stopping(target: S) -> Iterator[S]:
    try:
        yield target
    finally:
        target.stop()
        target.join()


def configure_structlog() -> None:
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.processors.add_log_level,
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            structlog.processors.TimeStamper(),
            structlog.dev.ConsoleRenderer(),
        ],
        wrapper_class=structlog.make_filtering_bound_logger(logging.NOTSET),
        context_class=dict,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=False,
    )


def create_socketio_app() -> tuple[Flask, SocketIO]:
    app = Flask(__name__)
    socketio = SocketIO(app, cors_allowed_origins="*")

    return (app, socketio)


class SocketIOHandler(PatternMatchingEventHandler):
    def __init__(
        self,
        socketio: SocketIO,
        patterns: list[str] | None = None,
        ignore_patterns: list[str] | None = None,
        ignore_directories: bool = False,
        case_sensitive: bool = False,
    ) -> None:
        super().__init__(
            patterns=patterns,
            ignore_patterns=ignore_patterns,
            ignore_directories=ignore_directories,
            case_sensitive=case_sensitive,
        )
        self.socketio = socketio

    def on_any_event(self, event: FileSystemEvent) -> None:
        src_path = event.src_path
        if isinstance(src_path, bytes):
            src_path = src_path.decode()

        path = Path(src_path).relative_to(Path(__file__).parent)
        parts = path.name.split(".")
        if len(parts) > 2:
            del parts[1]
        path = path.with_name(".".join(parts))
        logger.debug("change", path=str(path))
        self.socketio.emit("change", {"path": event.src_path})


class ShellCommandHandler(PatternMatchingEventHandler):
    def __init__(
        self,
        command: list[str],
        queue: queue.Queue[list[str]],
        patterns: list[str] | None = None,
        ignore_patterns: list[str] | None = None,
        ignore_directories: bool = False,
        case_sensitive: bool = False,
    ) -> None:
        super().__init__(
            patterns=patterns,
            ignore_patterns=ignore_patterns,
            ignore_directories=ignore_directories,
            case_sensitive=case_sensitive,
        )
        self.command = command
        self.queue = queue

    def on_any_event(self, event: FileSystemEvent) -> None:
        self.queue.put(self.command)


@dc.dataclass
class Process:
    proc: subprocess.Popen
    start: float = dc.field(default_factory=time.time, init=False)

    def poll(self) -> int | None:
        return self.proc.poll()

    def terminate(self) -> None:
        self.proc.terminate()


class ShellCommandDebouncer(threading.Thread):
    def __init__(self, timeout: float = 1.0) -> None:
        super().__init__()
        self.event = threading.Event()
        self.queue: queue.Queue[list[str]] = queue.Queue()
        self.procs: dict[str, Process] = {}
        self.timeout = timeout

    def run(self) -> None:
        while not self.event.is_set():
            try:
                command = self.queue.get(timeout=1)
            except queue.Empty:
                continue

            cmd = " ".join(command)
            if cmd in self.procs:
                if self.procs[cmd].poll() is not None:
                    # Command finished, remove it from the list.
                    del self.procs[cmd]
                elif time.time() - self.procs[cmd].start > self.timeout:
                    # Command started too long ago, re-enqueue it.
                    self.queue.put(command)
                    continue
                else:
                    # Do nothing, command is already running
                    continue

            prefix = click.style(">", fg="blue", bold=True)
            click.echo(f"{prefix} {cmd}")
            proc = Process(subprocess.Popen(command))
            self.procs[cmd] = proc

        for proc in self.procs.values():
            if proc.poll() is None:
                continue
            proc.terminate()

    def stop(self) -> None:
        self.event.set()


@click.command()
def main() -> int:
    configure_structlog()

    observer = Observer()

    root = Path(__file__).parent
    src = root / "src"
    requirements = root / "requirements"

    (app, socketio) = create_socketio_app()
    threading.Thread(
        target=socketio.run,
        args=(app, "localhost", 5010),
        kwargs=dict(use_reloader=False),
        daemon=True,
    ).start()

    with contextlib.ExitStack() as stack:
        stack.enter_context(subprocess.Popen(["just", "serve"]))
        shell_manager = ShellCommandDebouncer()
        stack.enter_context(stopping(shell_manager))
        shell_manager.start()

        socketio_handler = SocketIOHandler(socketio, patterns=["*.js", "*.css"])
        webpack = ShellCommandHandler(["npm", "run", "build"], shell_manager.queue, patterns=["*.ts", "*.scss"])
        webpack_config = ShellCommandHandler(
            ["npm", "run", "build"],
            shell_manager.queue,
            patterns=["webpack.config.js", "tsconfig.json", "package.json"],
        )
        sync_and_install = ShellCommandHandler(["just", "sync"], shell_manager.queue, patterns=["*.in"])

        observer.schedule(webpack, path=str(src / "frontend"), recursive=True)
        observer.schedule(webpack_config, path=str(root), recursive=False)
        observer.schedule(sync_and_install, path=str(requirements), recursive=True)
        observer.schedule(socketio_handler, path=str(src / "basingse" / "assets"), recursive=True)

        stack.enter_context(stopping(observer))
        observer.start()

        while observer.is_alive():
            observer.join(1)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
