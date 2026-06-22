from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from psycopg import Connection

from app.models import Project, ProjectCreate, Scan, ScanCreate


class ProjectRepository:
    def __init__(self, connection: Connection):
        self.connection = connection

    def create_project(self, payload: ProjectCreate) -> Project:
        project_id = f"project_{uuid4().hex}"
        timestamp = datetime.now(timezone.utc)

        with self.connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO projects (
                    id,
                    name,
                    repository_url,
                    description,
                    created_at,
                    updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING
                    id,
                    name,
                    repository_url AS "repositoryUrl",
                    description,
                    created_at AS "createdAt",
                    updated_at AS "updatedAt"
                """,
                (
                    project_id,
                    payload.name,
                    payload.repositoryUrl,
                    payload.description,
                    timestamp,
                    timestamp,
                ),
            )
            row = cursor.fetchone()

        return Project.model_validate(row)

    def list_projects(self) -> list[Project]:
        with self.connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    repository_url AS "repositoryUrl",
                    description,
                    created_at AS "createdAt",
                    updated_at AS "updatedAt"
                FROM projects
                ORDER BY created_at DESC
                """
            )
            rows = cursor.fetchall()

        return [Project.model_validate(row) for row in rows]

    def get_project(self, project_id: str) -> Project | None:
        with self.connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    name,
                    repository_url AS "repositoryUrl",
                    description,
                    created_at AS "createdAt",
                    updated_at AS "updatedAt"
                FROM projects
                WHERE id = %s
                """,
                (project_id,),
            )
            row = cursor.fetchone()

        if row is None:
            return None

        return Project.model_validate(row)

    def delete_project(self, project_id: str) -> bool:
        with self.connection.cursor() as cursor:
            cursor.execute("DELETE FROM projects WHERE id = %s", (project_id,))
            return cursor.rowcount > 0


class ScanRepository:
    def __init__(self, connection: Connection):
        self.connection = connection

    def create_scan(self, project_id: str) -> Scan:
        scan_id = f"scan_{uuid4().hex}"
        timestamp = datetime.now(timezone.utc)

        with self.connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO scans (
                    id,
                    project_id,
                    status,
                    created_at
                )
                VALUES (%s, %s, %s, %s)
                RETURNING
                    id,
                    project_id AS "projectId",
                    status,
                    created_at AS "createdAt",
                    started_at AS "startedAt",
                    completed_at AS "completedAt",
                    failure_reason AS "failureReason"
                """,
                (
                    scan_id,
                    project_id,
                    "Pending",
                    timestamp,
                ),
            )
            row = cursor.fetchone()

        return Scan.model_validate(row)

    def list_project_scans(self, project_id: str) -> list[Scan]:
        with self.connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    project_id AS "projectId",
                    status,
                    created_at AS "createdAt",
                    started_at AS "startedAt",
                    completed_at AS "completedAt",
                    failure_reason AS "failureReason"
                FROM scans
                WHERE project_id = %s
                ORDER BY created_at DESC
                """,
                (project_id,),
            )
            rows = cursor.fetchall()

        return [Scan.model_validate(row) for row in rows]

    def get_scan(self, scan_id: str) -> Scan | None:
        with self.connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    id,
                    project_id AS "projectId",
                    status,
                    created_at AS "createdAt",
                    started_at AS "startedAt",
                    completed_at AS "completedAt",
                    failure_reason AS "failureReason"
                FROM scans
                WHERE id = %s
                """,
                (scan_id,),
            )
            row = cursor.fetchone()

        if row is None:
            return None

        return Scan.model_validate(row)

    def update_scan_status(
        self,
        scan_id: str,
        status: str,
        started_at: datetime | None = None,
        completed_at: datetime | None = None,
        failure_reason: str | None = None,
    ) -> bool:
        with self.connection.cursor() as cursor:
            if started_at is not None:
                cursor.execute(
                    """
                    UPDATE scans
                    SET status = %s, started_at = %s
                    WHERE id = %s
                    """,
                    (status, started_at, scan_id),
                )
            elif completed_at is not None:
                cursor.execute(
                    """
                    UPDATE scans
                    SET status = %s, completed_at = %s, failure_reason = %s
                    WHERE id = %s
                    """,
                    (status, completed_at, failure_reason, scan_id),
                )
            else:
                cursor.execute(
                    """
                    UPDATE scans
                    SET status = %s
                    WHERE id = %s
                    """,
                    (status, scan_id),
                )
            return cursor.rowcount > 0

