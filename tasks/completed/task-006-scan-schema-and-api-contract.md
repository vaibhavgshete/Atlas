# Task

## Metadata

Task ID: TASK-006

Title: Define Scan Schema and Repository Scanning API Contract

Status:

* Completed

Priority:

* High

Assigned To:

* Architect Agent

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

Additional references:

* docs/decision-log.md
* docs/project-management-contract-v0.1.md
* agents/workflow.md
* agents/architect.md

---

# Objective

Define the approved Milestone 2 data shape for the `Scan` entity, update the database initialization schema, and define the backend API contract needed for scan creation, retrieval, and project scans listing.

---

# Background

Milestone 2 introduces the `Scan` database entity and new API endpoints. Per the workflow and agent definitions, new database schema work and API contract creation require Architect design and documentation before Developer implementation begins.

This task exists to define the contract, update the decision log with a new ADR, and create `docs/repository-scanning-contract-v0.1.md` to remove ambiguity for the Developer Agent.

---

# Requirements

* Define the `Scan` entity fields required for Milestone 2.
* Define the database table structure for `scans`.
* Define the backend API contract for:
  * Create Scan (`POST /api/projects/{projectId}/scans`)
  * Get Scan (`GET /api/scans/{scanId}`)
  * List Project Scans (`GET /api/projects/{projectId}/scans`)
* Document expected request and response shapes at a level sufficient for implementation.
* Record any required architectural decision in `docs/decision-log.md`.
* Ensure that no file analysis, dependency extraction, or repository intelligence features are added, keeping the scan limited to cloning/retrieval verification.

---

# Acceptance Criteria

The task is considered complete when:

* [x] The Milestone 2 `Scan` entity shape is defined.
* [x] The database schema for `scans` table and indexes is defined.
* [x] The API contract for Create, Get, and List scans is defined in `docs/repository-scanning-contract-v0.1.md`.
* [x] Any required architectural decision (ADR-005) is documented by the Architect Agent in `docs/decision-log.md`.
* [x] No out-of-scope intelligence capabilities are introduced.

---

# Out of Scope

Explicitly list what must NOT be implemented:

* Production code changes (database migrations or Python endpoint code)
* File analysis, directory mapping, or dependency parsing
* AI summaries or knowledge generation
* Authentication or authorization

---

# Technical Constraints

Implementation must:

* Follow approved architecture
* Follow current milestone scope
* Avoid introducing future features
* Keep implementation simple and maintainable

---

# Deliverables

Expected outputs.

Architecture:

* Approved Milestone 2 `Scan` schema definition and API contract in `docs/repository-scanning-contract-v0.1.md`.

Documentation:

* ADR update (ADR-005) in `docs/decision-log.md`.

---

# Testing Requirements

Minimum validation required:

* Schema and contract definitions are internally consistent with Milestone 2.
* Contract definitions do not conflict with existing Milestone 1 contract or architecture.
* Defined API surface covers all Milestone 2 backend operations.

---

# Blockers

To be filled if the task status is set to `Blocked`.

---

# Completion Notes

Summary of work completed:

* Created `docs/repository-scanning-contract-v0.1.md` containing the `Scan` entity definition, database schema, API style, and endpoints (POST/GET/GET).
* Documented the architectural decision in `docs/decision-log.md` under ADR-005.

Known limitations:

* Repository cloning is out of scope of this task and will be implemented in TASK-007.

Follow-up recommendations:

* The Developer Agent should implement backend models, repository functions, background task worker, and endpoints referencing the contract in `docs/repository-scanning-contract-v0.1.md`.

---

# Review Outcome

Reviewer Status:

* Approved

Reviewer Notes:

The scan schema, database initialization plan, and API contracts defined in docs/repository-scanning-contract-v0.1.md are clean, simple, and strictly aligned with Milestone 2 guidelines. ADR-005 has been recorded. Approved.

