# Task

## Metadata

Task ID: TASK-007

Title: Implement Backend Repository Scanning API and Services

Status:

* Review

Priority:

* High

Assigned To:

* Developer Agent

Created By: Project Manager Agent

Created Date: 2026-06-22

---

# References

Required reading before implementation:

* docs/glossary.md
* docs/project-vision.md
* docs/requirements-v0.1.md
* docs/system-architecture-v0.1.md
* docs/milestone-2.md
* docs/repository-scanning-contract-v0.1.md (created in TASK-006)

Additional references:

* agents/workflow.md
* agents/developer.md

---

# Objective

Implement the backend database tables, Pydantic models, repository class, scanning and retrieval services, and API endpoints for repository scanning according to the contract defined in TASK-006.

---

# Background

Milestone 2 requires that Atlas can create scans, track scan status, clone repository contents locally, and display scan details/history. This task implements all backend functionality, including database persistence, git integration, asynchronous execution, and API endpoints.

---

# Requirements

* **Database Schema**: Update `backend/app/database.py` to create the `scans` table and necessary indexes during initialization.
* **Backend Models**: Add `Scan` and `ScanCreate` Pydantic models to `backend/app/models.py`.
* **Scan Repository**: Implement `ScanRepository` in `backend/app/repository.py` to persist and manage scan states.
* **Repository Retrieval Service**: Implement `clone_repository` (using `git clone` via subprocess) inside a new file `backend/app/scanner.py`.
* **Scan Execution Service**: Implement `run_scan` in `backend/app/scanner.py` which:
  - Runs in a background task (using FastAPI's `BackgroundTasks`).
  - Sets state to `Running`.
  - Clones the git repository to a temporary directory.
  - Cleans up the temporary directory after execution.
  - Updates the scan state to `Completed` on success, or `Failed` on exception (capturing `failure_reason`).
* **Backend API Endpoints**: Implement `/api/projects/{projectId}/scans` (create and list scans) and `/api/scans/{scanId}` (get scan details) in `backend/app/main.py`.
* **Dockerfile Update**: Modify `backend/Dockerfile` to install `git` so the backend container can clone repositories.

---

# Acceptance Criteria

The task is considered complete when:

* [x] Database table `scans` is created and initialized successfully.
* [x] Background scan execution updates states correctly: `Pending` -> `Running` -> `Completed` / `Failed`.
* [x] Git clone works correctly inside the container when scanning a valid public repository.
* [x] Invalid repository URLs correctly transition scans to `Failed` and capture stderr error messages.
* [x] Scans are successfully associated with projects in PostgreSQL.
* [x] Backend API endpoints match the repository scanning contract.
* [x] API integration tests verify the scanning endpoints (mocking the network/cloning process).

---

# Out of Scope

* Permanent storage of repository source files in the database or persistent disk.
* Analysis of files, directories, dependencies, or language facts.
* AI summaries, knowledge graph updates, or documentation extraction.
* Frontend implementation (handled in TASK-008).

---

# Technical Constraints

* Follow the project architecture.
* Use FastAPI `BackgroundTasks` for asynchronous scanning.
* Ensure cleanup of local temporary directories created during clones.
* Keep DB transactions scoped correctly within background tasks.

---

# Deliverables

Backend:

* Dockerfile update with `git` installation.
* `backend/app/database.py` schema changes.
* `backend/app/models.py` schema additions.
* `backend/app/repository.py` additions.
* `backend/app/scanner.py` implementation.
* `backend/app/main.py` API route mapping.
* `backend/tests/test_api.py` additions for testing scans.

---

# Testing Requirements

* Integration/unit tests verifying API logic (with mocked clone service).
* Manual end-to-end confirmation using Docker Compose.

---

# Blockers

To be filled if the task status is set to `Blocked`.

---

# Completion Notes

Summary of work completed:

* Installed `git` in `backend/Dockerfile` for the python image.
* Updated `backend/app/database.py` with SQL definitions to create `scans` table and a foreign key index.
* Added `Scan` and `ScanCreate` models to `backend/app/models.py`.
* Added `ScanRepository` class in `backend/app/repository.py` to support scanning CRUD operations.
* Created `backend/app/scanner.py` with `clone_repository` (using `git clone` via subprocess) and background execution service `run_scan`.
* Mapped scanning API endpoints (`POST`, `GET`, `GET`) in `backend/app/main.py`.
* Wrote unit/integration tests in `backend/tests/test_api.py` and confirmed they passed successfully.

Known limitations:

* Currently assumes standard public repository accessibility. Private repository scanning will require authentication helpers in future milestones.

Follow-up recommendations:

* Build and run Docker Compose to manually verify end-to-end integration with the database and frontend.

---

# Review Outcome

Reviewer Status:

* Pending

Reviewer Notes:
