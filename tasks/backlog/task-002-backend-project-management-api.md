# Task

## Metadata

Task ID: TASK-002

Title: Implement Backend Project Management API and Persistence

Status:

* Backlog

Priority:

* High

Assigned To:

* Developer Agent

Created By: Project Manager Agent

Created Date: 2026-06-21

---

# References

Required reading before implementation:

* docs/glossary.md
* docs/project-vision.md
* docs/requirements-v0.1.md
* docs/system-architecture-v0.1.md

Additional references:

* docs/milestone-1.md
* docs/decision-log.md
* agents/workflow.md
* agents/developer.md
* tasks/backlog/task-001-project-schema-and-api-contract.md

---

# Objective

Implement the backend capability to create, list, retrieve, and delete Atlas projects with data persisted in PostgreSQL.

---

# Background

Milestone 1 requires Atlas to manage projects without performing any repository analysis. The backend is responsible for project orchestration and storage access, and this task delivers the backend portion of the milestone.

This task should begin only after the Architect-defined schema and API contract are available.

---

# Requirements

* Implement backend support for creating a project
* Implement backend support for listing projects
* Implement backend support for retrieving a single project
* Implement backend support for deleting a project
* Persist Milestone 1 project data in PostgreSQL
* Support required fields:
* Project Name
* Repository URL
* Support optional field:
* Description
* Store created and updated timestamps for the `Project` entity
* Return data in the format defined by the approved contract

---

# Acceptance Criteria

The task is considered complete when:

* [ ] Create Project API is implemented
* [ ] List Projects API is implemented
* [ ] Get Project API is implemented
* [ ] Delete Project API is implemented
* [ ] Project data persists in PostgreSQL
* [ ] Backend behavior follows the approved schema and API contract
* [ ] No repository scanning functionality is added

---

# Out of Scope

Explicitly list what must NOT be implemented.

* Update project functionality unless explicitly added to approved task scope later
* Repository cloning
* Repository scanning
* Fact extraction
* Summary generation
* Authentication or user management
* Any entity other than `Project`

Anything listed here must not be implemented during this task.

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

Backend:

* Project create endpoint
* Project list endpoint
* Project details endpoint
* Project delete endpoint

Database:

* Project table or migration aligned to the approved schema

---

# Testing Requirements

Minimum validation required.

* API endpoint behavior tested
* Database persistence verified
* Required field handling verified
* Delete behavior verified

---

# Blockers

To be filled if the task status is set to `Blocked`.

Describe the blocker clearly:

* What information is missing?
* What decision is needed?
* Who needs to resolve it?

---

# Completion Notes

To be filled after implementation.

Summary of work completed:

* Item 1
* Item 2

Known limitations:

* Limitation 1

Follow-up recommendations:

* Recommendation 1

---

# Review Outcome

Reviewer Status:

* Pending

Reviewer Notes:

(To be completed during review - document specific changes required if status is Changes Requested)
