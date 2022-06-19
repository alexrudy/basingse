from collections.abc import Iterator

import pytest
from basingse.models.base import Base
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session


@pytest.fixture
def engine() -> Iterator[Engine]:
    """Engine fixture"""

    eng = create_engine("sqlite:///:memory:")
    yield eng


@pytest.fixture
def schema(engine: Engine) -> Iterator[Engine]:

    # Create a 'schema' in memory for SQLite
    engine.execute("ATTACH ':memory:' AS auth;")

    Base.metadata.create_all(engine)

    yield engine

    Base.metadata.drop_all(engine)


@pytest.fixture
def session(schema: Engine) -> Iterator[Session]:
    session = Session(bind=schema)
    yield session
    session.rollback()
    session.close()
