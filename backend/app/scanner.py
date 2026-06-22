from __future__ import annotations

import logging
import subprocess
import tempfile
from datetime import datetime, timezone

from app.database import connection_scope
from app.repository import ScanRepository

logger = logging.getLogger(__name__)


def clone_repository(repo_url: str, dest_path: str) -> None:
    logger.info(f"Cloning repository {repo_url} to {dest_path}")
    result = subprocess.run(
        ["git", "clone", "--depth", "1", repo_url, dest_path],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        error_msg = result.stderr.strip() or f"git clone exited with code {result.returncode}"
        logger.error(f"Clone failed: {error_msg}")
        raise Exception(error_msg)


def run_scan(scan_id: str, project_id: str, repo_url: str) -> None:
    logger.info(f"Starting background scan {scan_id} for project {project_id}")
    
    with connection_scope() as connection:
        scan_repo = ScanRepository(connection)
        scan_repo.update_scan_status(
            scan_id=scan_id,
            status="Running",
            started_at=datetime.now(timezone.utc),
        )

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            clone_repository(repo_url, temp_dir)

        logger.info(f"Scan {scan_id} completed successfully")
        with connection_scope() as connection:
            scan_repo = ScanRepository(connection)
            scan_repo.update_scan_status(
                scan_id=scan_id,
                status="Completed",
                completed_at=datetime.now(timezone.utc),
            )
    except Exception as e:
        logger.error(f"Scan {scan_id} failed: {e}")
        failure_reason = str(e)
        with connection_scope() as connection:
            scan_repo = ScanRepository(connection)
            scan_repo.update_scan_status(
                scan_id=scan_id,
                status="Failed",
                completed_at=datetime.now(timezone.utc),
                failure_reason=failure_reason,
            )
