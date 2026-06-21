from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from psycopg import Connection

from app.models import Project, ProjectCreate


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
