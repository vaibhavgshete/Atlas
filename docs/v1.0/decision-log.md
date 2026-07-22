# Atlas Decision Log

## Purpose

This document records important project decisions.

The goal is to preserve reasoning behind architectural and product choices.

**Owner:** Architect Agent is responsible for writing and maintaining ADR entries.

---

## ADR-001

Date: 2026-06-21

Decision:
Atlas v0.1 will support only a single repository.

Reason:
Single repository support reduces complexity and allows faster validation of the core knowledge-generation workflow.

Status:
Accepted

---

## ADR-002

Date: 2026-06-21

Decision:
Atlas will store all scan history.

Reason:
Historical scans provide the foundation for future change tracking and project evolution analysis.

Status:
Accepted

---

## ADR-003

Date: 2026-06-21

Decision:
Atlas will store structured facts before generating summaries.

Reason:
Structured facts can be reused by future capabilities without requiring repository rescans.

Status:
Accepted

---

## ADR-004

Date: 2026-06-21

Decision:
Milestone 1 project management will use a single `Project` entity with fields `id`, `name`, `repositoryUrl`, `description`, `createdAt`, and `updatedAt`, and the backend will expose `POST /api/projects`, `GET /api/projects`, `GET /api/projects/{projectId}`, and `DELETE /api/projects/{projectId}`.

Reason:
Milestone 1 requires a simple end-to-end application foundation for project creation, listing, details, deletion, PostgreSQL persistence, and frontend-backend integration without introducing repository analysis scope.

Status:
Accepted
