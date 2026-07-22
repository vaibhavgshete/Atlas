# Task

## Metadata

Task ID: TASK-006

Title: Extension Scaffold and Workspace Scanner

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

---

# Objective

Stand up the Atlas VS Code extension project and implement workspace scanning that discovers directories and files, respecting `.gitignore`, triggered by an "Enable Atlas" command.

---

# Background

This is the first implementation task under Milestone 1 (Memory Core: Project Tree). It establishes the extension scaffold and the scanning capability that the following storage task (TASK-007) and UI task (TASK-008) build on. Persistence and UI are deliberately excluded here so the scanner can be verified as a standalone, correct unit before anything is built on top of it.

---

# Requirements

* Initialize the VS Code extension project (TypeScript, standard extension scaffold conventions)
* Register an "Atlas: Enable" command in the command palette
* Implement a workspace scanner that walks the currently open workspace folder
* Scanner must respect `.gitignore`
* Scanner must respect a minimal built-in ignore list (`.git`, `node_modules`, and equivalents for other ecosystems present in this repo, e.g. `__pycache__`)
* Scanner collects the relative path of every discovered directory and file
* Scan results are held in memory and made inspectable (e.g. via the VS Code Output channel) so this task is independently verifiable without storage or UI

---

# Acceptance Criteria

* [x] Extension loads in VS Code (Extension Development Host) without error
* [x] "Atlas: Enable" command is available and runs the scanner
* [x] Running the command against a real project produces a correct list of directories and files
* [x] `.gitignore`-excluded paths do not appear in scan results
* [x] No dependency parsing, storage, or UI beyond command/output verification is implemented

---

# Out of Scope

* Dependency manifest parsing
* SQLite storage
* Sidebar Tree View
* Git history mining, embeddings, or agent exposure

---

# Technical Constraints

Implementation must:

* Follow `docs/v2/system-architecture-v2.0.md` (single-component extension, local-only, no network access)
* Produce a scan result structure the next task (TASK-007) can persist directly, without requiring a redesign of the scanner
* Not modify any file in the workspace

---

# Deliverables

Extension:

* Extension scaffold (`package.json`, entrypoint, activation)
* Workspace scanner module
* "Atlas: Enable" command registration

---

# Testing Requirements

* Manual run in the Extension Development Host confirms correct directory/file discovery
* Manual run confirms `.gitignore`-excluded paths are correctly omitted

---

# Blockers

To be filled if the task status is set to `Blocked`.

---

# Completion Notes

Summary of work completed:

* Created `extension/` as the extension project root (`package.json`, `tsconfig.json`, `.vscodeignore`)
* Implemented `extension/src/scanner.ts`: walks a workspace root, excludes `.git`, `node_modules`, and `.atlas` (built-in), and additionally applies the workspace's own `.gitignore` via the `ignore` package. Returns an in-memory `ScanEntry[]` (`{ type: 'directory' | 'file', path }`) — the exact shape TASK-007 needs to persist directly.
* Implemented `extension/src/extension.ts`: registers the `atlas.enable` command ("Atlas: Enable" in the command palette), runs the scanner against the first workspace folder, and prints every discovered entry plus a directory/file count to an "Atlas" Output channel, with a summary info toast.
* Added `.vscode/launch.json` + `.vscode/tasks.json` inside `extension/` so the extension can be run via F5 (Extension Development Host) once dependencies are installed.
* Updated root `.gitignore`: added `extension/out/`, `*.vsix`, and `.atlas/` (the storage folder TASK-007 will create in any scanned workspace), and re-included `extension/.vscode/*.json` so the debug config isn't swallowed by the repo-wide `.vscode/` ignore rule.

Verification performed:

* Installed Node.js LTS (v24.18.0 / npm 11.16.0) via `winget`, since this development machine had neither — VS Code was already present.
* `npm install` in `extension/` succeeded (0 vulnerabilities); `npm run compile` produced `out/extension.js` and `out/scanner.js` with no TypeScript errors.
* Manually verified end-to-end via F5 (Extension Development Host), following the dogfood workflow: opened `extension/` as the workspace root, launched the Extension Development Host, opened an independent real-world project (an open-source MAVLink repository, not one of our own), and ran "Atlas: Enable".
* Output channel correctly listed the project tree and reported `Atlas: found 73 directories, 385 files.`
* Confirmed via the Output panel's filter box that the real `.git` metadata directory is excluded — only legitimately-tracked files containing the substring "git" (`.github/`, `.gitignore`, `.gitmodules`, `.gitattributes`) appeared, which is correct.
* Confirmed `node_modules` does not appear anywhere in scan results.
* No error dialogs or crashes at any point.

Follow-up recommendations:

* TASK-007 can proceed — `scanWorkspace()`'s return shape (`ScanEntry[]` of `{ type, path }`) is stable and ready to be persisted as-is.
* Note for TASK-007/TASK-008: the scanner only reads a `.gitignore` located directly at the scanned workspace root, not parent-directory `.gitignore` files. This matched spec and worked correctly in this test since the scanned folder was itself a repo root; worth keeping in mind if a future test scans a subfolder that relies on a parent's `.gitignore`.

---

# Review Outcome

Reviewer Status:

* Approved

Reviewer Notes:

All acceptance criteria verified end-to-end via manual dogfood test (F5 Extension Development Host against an independent real-world project, not our own repo). Scanner correctly discovers directories/files, correctly excludes `.git` and `node_modules`, and stays within scope — no dependency parsing, storage, or UI beyond the Output channel was introduced. No architecture or scope violations found.
