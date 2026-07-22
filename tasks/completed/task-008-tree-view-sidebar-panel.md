# Task

## Metadata

Task ID: TASK-008

Title: Tree View Sidebar Panel

Status:

* Completed

Priority:

* High

Assigned To:

* Developer Agent

Created By: Project Manager Agent

Created Date: 2026-07-22

---

# References

Required reading before implementation:

* docs/v2/glossary.md
* docs/v2/project-vision.md
* docs/v2/requirements-v2.0.md
* docs/v2/system-architecture-v2.0.md

Additional references:

* docs/v2/milestone-1.md
* docs/v2/decision-log.md
* tasks/backlog/task-006-extension-scaffold-and-workspace-scanner.md
* tasks/backlog/task-007-dependency-parsing-and-sqlite-storage.md

---

# Objective

Provide a VS Code sidebar view that renders the stored project tree from `.atlas/memory.db`, with a way to trigger a re-scan from the UI.

---

# Background

This is the dogfood-verification surface for Milestone 1. Without it, there is no way for a developer to visually confirm that Atlas built an accurate memory of the project — which is Milestone 1's actual success criteria.

---

# Requirements

* Register an Atlas sidebar view (Activity Bar container + Tree View)
* Render directories and files from `.atlas/memory.db` as a navigable tree
* Render discovered dependencies, grouped by source manifest
* Provide a re-scan action accessible from the view (e.g. a toolbar button) that re-triggers the scan-and-store flow from TASK-006/TASK-007
* View refreshes automatically after a re-scan completes

---

# Acceptance Criteria

* [x] Atlas sidebar view appears in VS Code's Activity Bar
* [x] View displays the directory/file tree matching `.atlas/memory.db` contents
* [x] View displays discovered dependencies grouped by manifest
* [x] Re-scan action in the view triggers a fresh scan and updates the displayed tree
* [x] View correctly reflects an empty state before the first scan has run

---

# Out of Scope

* Any editing of tree contents from the view
* Multi-workspace support
* Git history mining, embeddings, or agent exposure

---

# Technical Constraints

Implementation must:

* Be a read-only view backed directly by `.atlas/memory.db` — no separate in-memory state that can drift from storage
* Follow `docs/v2/system-architecture-v2.0.md`

---

# Deliverables

Extension:

* Tree View provider
* Sidebar/Activity Bar registration
* Re-scan command wired to the view

---

# Testing Requirements

* Manual verification in the Extension Development Host: enable Atlas on a real project, confirm the sidebar tree matches the real project structure
* Manual verification: modify the project, re-scan via the view, confirm the displayed tree updates

---

# Blockers

To be filled if the task status is set to `Blocked`.

---

# Completion Notes

Summary of work completed:

* Added `extension/src/treeView.ts`: `AtlasMemoryProvider implements vscode.TreeDataProvider`. Every `getChildren()` call reads fresh from `.atlas/memory.db` via `storage.ts`'s new `readMemory()` — no cached in-memory tree, per the read-only/no-drift constraint. Renders directories/files as a real nested tree (via `parent_path`), plus a synthetic top-level "Dependencies" node grouping dependencies by `source_manifest`.
* Added `readMemory()` to `extension/src/storage.ts` (alongside the existing `replaceMemory()` — kept together since both are the only code that touches the DB file). Returns `null` when `.atlas/memory.db` doesn't exist yet, which is the empty-state signal.
* `extension/resources/atlas-icon.svg`: hand-written minimal monochrome icon (simple 3-node hierarchy glyph) for the Activity Bar container — required by VS Code's `viewsContainers.activitybar` contribution point.
* `package.json`: added `viewsContainers.activitybar` (Atlas container), `views` (the `atlas.memoryView` tree), `viewsWelcome` (empty-state message with a clickable `[Scan Project](command:atlas.enable)` link — satisfies the empty-state acceptance criterion declaratively), and `menus.view/title` (puts `atlas.enable` as a toolbar refresh button on the view, reusing the existing command rather than adding a second one).
* `extension.ts`: registers the tree provider at activation, calls `treeProvider.refresh()` after every successful scan-and-store.

Verification performed (headless, before handing back for the interactive pass):

* `readMemory()` and `replaceMemory()` don't import `vscode`, so — same approach as TASK-006/007 — wrote a standalone Node script exercising the real pipeline against `backend/`, then reconstructed the tree using the exact same `parent_path`-grouping logic `treeView.ts` uses, and printed it as indented text. Directory nesting was correct (`app/`, `app/__pycache__/`, `tests/`, `tests/__pycache__/` all nested under the right parents).
* Dependency grouping-by-manifest reconstructed correctly against the 3 real `requirements.txt` entries.
* Confirmed the empty-state case directly: called `readMemory()` against a workspace with no `.atlas/` directory yet — returned `null` as expected, not an empty array or an exception.
* `package.json` validated as well-formed JSON after the new contribution points were added.
* `npm run compile` succeeded with 0 errors; `out/treeView.js` present alongside the others.

Known finding (not a defect in this task, logged for visibility): scanning `backend/` on its own surfaces `__pycache__` clutter, because that folder has no local `.gitignore` and `__pycache__` isn't in `scanner.ts`'s built-in ignore list (a TASK-006 concern, not TASK-008). Discussed with the user — decision was to leave as-is for now and revisit only if it becomes a real problem in practice.

Known gap — what wasn't verified:

* The Activity Bar icon rendering, the tree view's actual visual nesting/collapse behavior, the toolbar refresh button, and the `viewsWelcome` empty-state message have not been confirmed inside a running Extension Development Host — that requires a human F5 pass, same pattern as TASK-006/007.

Follow-up recommendations:

* Do one F5 pass: reload the Extension Development Host, open the Atlas icon in the Activity Bar, expand the tree, expand "Dependencies," click the toolbar refresh button, and (ideally) check the empty-state message on a project that hasn't been scanned yet.
* Once confirmed, TASK-009 (Milestone 1 review) is the last step before Milestone 1 is done.

---

# Review Outcome

Reviewer Status:

* Approved

Reviewer Notes:

Human-verified end-to-end in the Extension Development Host per the F5 checklist: Activity Bar icon present, tree/dependency rendering confirmed, empty-state welcome message confirmed, toolbar refresh confirmed. Combined with the headless verification of the read-path and reconstruction logic, all acceptance criteria are satisfied. No scope creep — read-only, no editing, no multi-workspace support, no git/embeddings/agent-exposure work introduced.
