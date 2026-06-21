from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = os.getenv("ATLAS_APP_NAME", "Atlas Backend")
    database_url: str = os.getenv(
        "DATABASE_URL",
        "postgresql://atlas:atlas@localhost:5432/atlas",
    )
    skip_db_init: bool = os.getenv("ATLAS_SKIP_DB_INIT", "false").lower() == "true"


settings = Settings()
