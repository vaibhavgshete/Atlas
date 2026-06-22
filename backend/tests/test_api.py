from __future__ import annotations

from collections.abc import Generator
import os

import pytest
from fastapi.testclient import TestClient

os.environ["ATLAS_SKIP_DB_INIT"] = "true"

from app.main import app, get_repository, get_scan_repository
from app.models import Project, ProjectCreate, Scan


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


class InMemoryScanRepository:
    def __init__(self) -> None:
        self.scans: dict[str, Scan] = {}

    def create_scan(self, project_id: str) -> Scan:
        scan = Scan(
            id=f"scan_{len(self.scans) + 1}",
            projectId=project_id,
            status="Pending",
            createdAt="2026-06-22T10:00:00Z",
            startedAt=None,
            completedAt=None,
            failureReason=None,
        )
        self.scans[scan.id] = scan
        return scan

    def list_project_scans(self, project_id: str) -> list[Scan]:
        return [s for s in self.scans.values() if s.projectId == project_id]

    def get_scan(self, scan_id: str) -> Scan | None:
        return self.scans.get(scan_id)

    def update_scan_status(
        self,
        scan_id: str,
        status: str,
        started_at = None,
        completed_at = None,
        failure_reason: str | None = None,
    ) -> bool:
        if scan_id in self.scans:
            scan = self.scans[scan_id]
            scan.status = status
            if started_at:
                scan.startedAt = started_at
            if completed_at:
                scan.completedAt = completed_at
            if failure_reason:
                scan.failureReason = failure_reason
            return True
        return False


@pytest.fixture()
def client() -> Generator[TestClient, None, None]:
    repository = InMemoryProjectRepository()
    scan_repository = InMemoryScanRepository()

    def override_repository() -> InMemoryProjectRepository:
        return repository

    def override_scan_repository() -> InMemoryScanRepository:
        return scan_repository

    app.dependency_overrides[get_repository] = override_repository
    app.dependency_overrides[get_scan_repository] = override_scan_repository

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture(autouse=True)
def mock_run_scan(monkeypatch):
    def mock_run(scan_id, project_id, repo_url):
        pass
    monkeypatch.setattr("app.main.run_scan", mock_run)


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


def test_create_scan(client: TestClient) -> None:
    # 1. Create project
    create_proj = client.post(
        "/api/projects",
        json={
            "name": "Atlas",
            "repositoryUrl": "https://github.com/example/atlas",
        },
    )
    project_id = create_proj.json()["id"]

    # 2. Create scan
    create_scan = client.post(f"/api/projects/{project_id}/scans")
    assert create_scan.status_code == 201
    scan_data = create_scan.json()
    assert scan_data["projectId"] == project_id
    assert scan_data["status"] == "Pending"

    # 3. Get scan
    scan_id = scan_data["id"]
    get_scan = client.get(f"/api/scans/{scan_id}")
    assert get_scan.status_code == 200
    assert get_scan.json()["id"] == scan_id

    # 4. List scans
    list_scans = client.get(f"/api/projects/{project_id}/scans")
    assert list_scans.status_code == 200
    assert len(list_scans.json()) == 1
    assert list_scans.json()[0]["id"] == scan_id


def test_create_scan_project_not_found(client: TestClient) -> None:
    response = client.post("/api/projects/project_missing/scans")
    assert response.status_code == 404
    assert response.json() == {
        "error": {
            "code": "PROJECT_NOT_FOUND",
            "message": "Project not found.",
        }
    }


def test_get_scan_not_found(client: TestClient) -> None:
    response = client.get("/api/scans/scan_missing")
    assert response.status_code == 404
    assert response.json() == {
        "error": {
            "code": "SCAN_NOT_FOUND",
            "message": "Scan not found.",
        }
    }
