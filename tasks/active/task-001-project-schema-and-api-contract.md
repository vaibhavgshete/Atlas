# Task

## Metadata

Task ID: TASK-001

Title: Define Project Schema and Project Management API Contract

Status:

* Completed

Priority:

* High

Assigned To:

* Architect Agent

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
* docs/project-management-contract-v0.1.md
* agents/workflow.md
* agents/architect.md

---

# Objective

Define the approved Milestone 1 data shape for the `Project` entity and the backend API contract needed for project creation, listing, retrieval, and deletion.

---

# Background

Milestone 1 introduces the first database entity and the first backend API surface for Atlas. Per the workflow and agent definitions, new database schema work and API contract creation require Architect review before Developer implementation begins.

This task exists to remove ambiguity for the Developer Agent and ensure Milestone 1 stays within the approved architecture and scope.

Human direction on 2026-06-21: The Project Manager should continue the documented workflow and drive Milestone 1 through completion. This task is therefore reactivated and routed for architecture completion before any Developer implementation begins.

---

# Requirements

* Define the `Project` entity fields required for Milestone 1
* Define field-level expectations for required and optional inputs
* Define the backend API contract for:
* Create Project
* Get Project
* List Projects
* Delete Project
* Document expected request and response shapes at a level sufficient for implementation
* Define only the minimum validation explicitly required by approved requirements and milestone documents. Do not introduce additional validation rules without Architect approval.
* Record any required architectural decision in `docs/decision-log.md`

---

# Acceptance Criteria

The task is considered complete when:

* [x] The Milestone 1 `Project` entity shape is clearly defined
* [x] The API contract for create, get, list, and delete project operations is clearly defined
* [x] Any required architectural decision is documented by the Architect Agent
* [x] No repository scanning or future-scope concepts are introduced

---

# Out of Scope

Explicitly list what must NOT be implemented.

* Production code changes
* Repository cloning
* Repository scanning
* Scan entities or scan history implementation
* Authentication or authorization
* Additional entities beyond `Project`

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

Architecture:

* Approved Milestone 1 `Project` schema definition
* Approved project management API contract

Documentation:

* ADR update in `docs/decision-log.md` if required

---

# Testing Requirements

Minimum validation required.

* Contract definitions are internally consistent with Milestone 1
* Contract definitions do not conflict with current requirements or architecture
* Defined API surface covers all Milestone 1 backend operations

---

# Blockers

To be filled if the task status is set to `Blocked`.

Describe the blocker clearly:

* Resolved on 2026-06-21 by Project Manager routing this task to active Architect work per the documented workflow.

---

# Completion Notes

To be filled after implementation.

Summary of work completed:

* Defined the Milestone 1 `Project` entity fields and minimum validation in `docs/project-management-contract-v0.1.md`
* Defined the create, list, get, and delete project API contract for Milestone 1
* Recorded the approved architectural decision in `docs/decision-log.md` as ADR-004

Known limitations:

* The contract intentionally excludes update project behavior because it is not part of Milestone 1

Follow-up recommendations:

* Developer implementation should reference `docs/project-management-contract-v0.1.md` directly to avoid contract drift

---

# Review Outcome

Reviewer Status:

* Pending

Reviewer Notes:

(To be completed during review - document specific changes required if status is Changes Requested)
