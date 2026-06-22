# Task

## Metadata

Task ID: TASK-008

Title: Implement Frontend Repository Scanning UI

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

Update the frontend interface of Atlas to support repository scan operations, list scan history for projects, and show detailed information for individual scans.

---

# Background

Milestone 2 aims to give users the ability to trigger a repository scan and inspect previous scans. The current interface only supports viewing base project information. We need to add the Start Scan button, Scan History list, and Scan Details view to the Project Details page (`project.html`).

---

# Requirements

* **HTML Structure (`project.html`)**:
  - Add a **Scan History** list/table panel.
  - Add a **Start Scan** button (actionable from the Project Details area).
  - Add a **Scan Details** panel that is hidden by default and becomes visible when a scan is selected.
* **Styling (`styles.css`)**:
  - Define badge styles for status classes: `.badge`, `.badge-pending`, `.badge-running`, `.badge-completed`, `.badge-failed`.
  - Design list items/rows and detail grid layout for scans.
* **JavaScript Logic (`project-details.js`)**:
  - Fetch and list scan history (`GET /api/projects/{projectId}/scans`) when loading the project details page.
  - Bind click action to "Start Scan" (`POST /api/projects/{projectId}/scans`), initiate the scan, and refresh the history list.
  - Support selecting a scan from the history to populate and show the **Scan Details** panel.
  - Implement polling: if any scan has status `Pending` or `Running`, poll the backend (`GET /api/projects/{projectId}/scans`) every 2 seconds until all scans are finished (`Completed` or `Failed`), and dynamically update the lists.

---

# Acceptance Criteria

The task is considered complete when:

* [x] "Start Scan" button is present and calls the POST scan endpoint.
* [x] Previous scans are displayed in a list with their status, created time, and a view details button.
* [x] Selecting a scan displays the Scan ID, Status, Created Time, Completed Time, and Failure Reason (if failed).
* [x] Scanning status transitions are displayed in real-time or via automatic polling.
* [x] The UI looks premium, consistent with the rest of the application, and uses appropriate colors/shapes.

---

# Out of Scope

* AI summary display (out of scope for Milestone 2).
* Fact extraction tables or file explorer trees.
* Authentication.

---

# Technical Constraints

* Keep HTML, CSS, and JS clean and modular.
* Ensure polling is properly stopped when the page is unloaded or when all active scans complete.
* Handle API errors gracefully in the UI.

---

# Deliverables

Frontend:

* `frontend/project.html` layout update.
* `frontend/project-details.js` logic update.
* `frontend/styles.css` style definitions.

---

# Testing Requirements

* Verify UI buttons trigger requests (network tab inspection).
* Verify layout responsiveness and visual styles in the browser.

---

# Blockers

To be filled if the task status is set to `Blocked`.

---

# Completion Notes

Summary of work completed:

* Updated `frontend/project.html` to add elements for Scan History, Start Scan button, and Scan Details view.
* Modified `frontend/styles.css` to add status badges, styling for list items, animations, and transitions.
* Rewrote `frontend/project-details.js` to implement:
  - Repository scan creation.
  - Interactive scans list and details view mapping.
  - Scan state automatic polling (efficiently updating list and open details card every 2s).
  - Proper disabling/enabling of action buttons.

Known limitations:

* Polling is basic interval-based. Future versions could use WebSockets for real-time updates.

Follow-up recommendations:

* Verify E2E behavior using Docker Compose.

---

# Review Outcome

Reviewer Status:

* Pending

Reviewer Notes:
