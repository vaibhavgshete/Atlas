from __future__ import annotations

from collections.abc import Generator
import os

import pytest
from fastapi.testclient import TestClient

os.environ["ATLAS_SKIP_DB_INIT"] = "true"

from app.main import app, get_repository
from app.models import Project, ProjectCreate


class InMemoryProjectRepository:
    def __init__(self) -> None:
        self.projects: dict[str, Project] = {}

    def create_project(self, payload: ProjectCreate) -> Project:
        project = Project(
            id=f"project_{len(self.projects) + 1}",
            name=payload.name,
            repositoryUrl=payload.repositoryUrl,
            description=payload.description,
            createdAt="2026-06-21T10:00:00Z",
            updatedAt="2026-06-21T10:00:00Z",
        )
        self.projects[project.id] = project
        return project

    def list_projects(self) -> list[Project]:
        return list(self.projects.values())

    def get_project(self, project_id: str) -> Project | None:
        return self.projects.get(project_id)

    def delete_project(self, project_id: str) -> bool:
        return self.projects.pop(project_id, None) is not None


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    repository = InMemoryProjectRepository()

    def override_repository() -> InMemoryProjectRepository:
        return repository

    app.dependency_overrides[get_repository] = override_repository

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


def test_create_project(client: TestClient) -> None:
    response = client.post(
        "/api/projects",
        json={
            "name": "Atlas",
            "repositoryUrl": "https://github.com/example/atlas",
            "description": "Knowledge platform",
        },
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Atlas"
    assert data["repositoryUrl"] == "https://github.com/example/atlas"
    assert data["description"] == "Knowledge platform"


def test_create_project_requires_name_and_repository_url(client: TestClient) -> None:
    response = client.post("/api/projects", json={"description": "missing fields"})

    assert response.status_code == 400
    assert response.json() == {
        "error": {
            "code": "VALIDATION_ERROR",
            "message": "Required fields are missing.",
        }
    }


def test_list_and_get_projects(client: TestClient) -> None:
    create_response = client.post(
        "/api/projects",
        json={
            "name": "Atlas",
            "repositoryUrl": "https://github.com/example/atlas",
            "description": "Knowledge platform",
        },
    )
    project_id = create_response.json()["id"]

    list_response = client.get("/api/projects")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    get_response = client.get(f"/api/projects/{project_id}")
    assert get_response.status_code == 200
    assert get_response.json()["id"] == project_id


def test_get_project_returns_not_found(client: TestClient) -> None:
    response = client.get("/api/projects/project_missing")

    assert response.status_code == 404
    assert response.json() == {
        "error": {
            "code": "PROJECT_NOT_FOUND",
            "message": "Project not found.",
        }
    }


def test_delete_project(client: TestClient) -> None:
    create_response = client.post(
        "/api/projects",
        json={
            "name": "Atlas",
            "repositoryUrl": "https://github.com/example/atlas",
        },
    )
    project_id = create_response.json()["id"]

    delete_response = client.delete(f"/api/projects/{project_id}")
    assert delete_response.status_code == 204

    get_response = client.get(f"/api/projects/{project_id}")
    assert get_response.status_code == 404
