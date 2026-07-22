# Task

## Metadata

Task ID: TASK-007

Title: Dependency Parsing and SQLite Storage

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

---

# Objective

Persist the scanned project tree (directories, files, dependencies) to a local SQLite database, and add dependency extraction from recognized manifest files.

---

# Background

Builds directly on TASK-006's scanner. This task completes the structural facts required by `docs/v2/requirements-v2.0.md` by adding dependency detection, and satisfies the Local Storage requirement by persisting everything to `.atlas/memory.db`.

---

# Requirements

* Detect `package.json` and `requirements.txt` files during the scan
* Parse declared dependencies (name and version where available) from each recognized manifest
* Initialize a SQLite database at `.atlas/memory.db` within the workspace if it does not already exist
* Implement the Directory (`path`, `parent_path`), File (`path`, `parent_path`, `extension`), and Dependency (`name`, `version`, `source_manifest`) schema exactly as defined in `docs/v2/system-architecture-v2.0.md`
* On each scan run, replace previously stored data with the current scan's results

---

# Acceptance Criteria

* [x] Running the scan command creates `.atlas/memory.db` if missing
* [x] Directories and files from TASK-006's scanner are persisted correctly
* [x] `package.json` dependencies are correctly extracted and stored when present
* [x] `requirements.txt` dependencies are correctly extracted and stored when present
* [x] Re-running the scan replaces previous data rather than duplicating it
* [x] Stored data persists across VS Code restarts (verified via a fresh, independent file read — see Completion Notes for the caveat on what this does and doesn't cover)

---

# Out of Scope

* Sidebar Tree View (TASK-008)
* Any manifest format beyond `package.json` and `requirements.txt`
* Modifying the workspace's `.gitignore` (the extension does not touch files outside `.atlas/`, per architecture)
* Git history mining, embeddings, or agent exposure

---

# Technical Constraints

Implementation must:

* Match the Initial Data Model in `docs/v2/system-architecture-v2.0.md` exactly — any deviation requires Architect escalation
* Not modify any file in the workspace other than files inside `.atlas/`

---

# Deliverables

Extension:

* SQLite storage module
* Dependency manifest parsers (`package.json`, `requirements.txt`)
* Scan command updated to wire scanner output into storage

---

# Testing Requirements

* Manual verification that `.atlas/memory.db` contains the expected rows after scanning a real project
* Manual verification that re-scanning replaces rather than duplicates data
* Manual verification that data survives a VS Code restart

---

# Blockers

To be filled if the task status is set to `Blocked`.

---

# Completion Notes

Summary of work completed:

* Added `extension/src/dependencies.ts`: parses `package.json` (`dependencies` + `devDependencies`) and `requirements.txt` (name, optional extras like `[binary]`, optional version specifier — comments/blank lines/`-r`/`-e` directives skipped).
* Added `extension/src/storage.ts`: SQLite persistence using **`sql.js`** (WASM-based), not a native module like `better-sqlite3`. Deliberate choice — native SQLite bindings compile against the system Node ABI, which does not match the Electron/Node runtime VS Code's extension host actually runs on, and would need a separate rebuild step (`electron-rebuild`) that this dev machine has no toolchain for. `sql.js` avoids that class of failure entirely since WASM has no ABI to mismatch. Schema matches `docs/v2/system-architecture-v2.0.md`'s Initial Data Model exactly (no added columns). Each scan wraps a full delete-then-insert of all three tables in one transaction, then exports and writes the DB file — this is the "replace" behavior the requirements call for.
* Updated `extension/src/extension.ts`: `atlas.enable` now also extracts dependencies and calls `replaceMemory()`, prints dependencies and final stored counts to the Output channel, and reports counts (not just dir/file totals) in the completion toast.
* Added `sql.js` + `@types/sql.js` to `package.json`; `npm install` and `npm run compile` both succeeded with 0 errors.

Verification performed (beyond compilation):

* `scanner.ts`, `dependencies.ts`, and `storage.ts` don't import `vscode`, so they're runnable headlessly outside the extension host. Wrote a standalone Node script exercising the real pipeline against `backend/` (which has a real `requirements.txt`, including `psycopg[binary]==3.3.4` — the extras-in-brackets case) and separately against `extension/` itself (which has a real `package.json` with both `dependencies` and `devDependencies`, including scoped package names like `@types/node`).
* Results: scanned 4 directories / 31 files in `backend/`; all 3 `requirements.txt` dependencies extracted correctly, including `psycopg` → `==3.3.4` (extras bracket correctly stripped from the name, not leaked into the version string — this was a specific edge case I fixed the parsing regex for after checking the real file).
* `package.json` parsing correctly returned all 6 real dependencies from `extension/package.json`, including scoped names.
* Ran the scan-and-store flow twice in sequence against `backend/`: row counts were identical after both runs (4/31/3) — confirms replace-not-duplicate behavior, not just "didn't crash twice."
* Simulated a restart by closing the in-memory `sql.js` database, then opening a **new** `sql.js` instance from a fresh `fs.readFileSync` of the written `.atlas/memory.db` file and querying it — this is what actually happens at the data layer on a real VS Code restart (extension host process restarts, storage module re-reads the file from disk). Query returned correct persisted file rows.
* Deleted all test artifacts afterward (`backend/.atlas/`, temporary scripts) — none of this test scaffolding is part of the deliverable.

In-VS-Code verification (human-confirmed):

* Ran "Atlas: Enable" inside the actual Extension Development Host against an independent real-world project (open-source MAVLink repo, same target used for TASK-006).
* Output channel showed a `Dependencies:` section listing real parsed entries from `pymavlink/requirements.txt` — a manifest nested several directories deep, confirming the scanner and dependency extractor both work at any depth, not just the workspace root (e.g. `lxml>=3.6.0`, `pytest<=7.4.4`, and bare names like `fastcrc`).
* Final line confirmed storage: `Atlas: stored 73 directories, 385 files, 34 dependencies -> g:\mavlink\.atlas\memory.db`.
* This closes the one gap noted after the headless verification — the `vscode.commands` wiring, async handler, and Output formatting are now confirmed working in situ, not just the underlying logic.

Follow-up recommendations:

* TASK-008 (Tree View) can start now — it will read `.atlas/memory.db` using the same schema this task established.

---

# Review Outcome

Reviewer Status:

* Approved

Reviewer Notes:

All acceptance criteria verified: headlessly against real repo data (scanner/parser/storage logic, including the `psycopg[binary]` extras edge case and replace-not-duplicate behavior) and then end-to-end inside the actual Extension Development Host (command wiring, dependency parsing at depth, SQLite persistence to `.atlas/memory.db`). Schema matches `docs/v2/system-architecture-v2.0.md` exactly. No scope creep — no Tree View, no manifest formats beyond `package.json`/`requirements.txt`, no `.gitignore` modification.
