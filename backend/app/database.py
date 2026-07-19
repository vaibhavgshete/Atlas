from __future__ import annotations

from contextlib import contextmanager
from threading import Lock
from typing import Iterator

import psycopg
from psycopg.rows import dict_row

from app.config import settings


_db_init_lock = Lock()
_db_initialized = False


def get_connection() -> psycopg.Connection:
    return psycopg.connect(settings.database_url, row_factory=dict_row)


@contextmanager
def connection_scope() -> Iterator[psycopg.Connection]:
    connection = get_connection()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def initialize_database() -> None:
    with connection_scope() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS projects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    repository_url TEXT NOT NULL,
                    description TEXT,
                    created_at TIMESTAMPTZ NOT NULL,
                    updated_at TIMESTAMPTZ NOT NULL
                )
                """
            )


def ensure_database_initialized(force: bool = False) -> None:
    global _db_initialized

    if _db_initialized and not force:
        return

    with _db_init_lock:
        if _db_initialized and not force:
            return
        initialize_database()
        _db_initialized = True
