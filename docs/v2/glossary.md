# Atlas v2 Glossary

New terms introduced for Atlas v2 (Memory Core). For v1 terminology, see `docs/v1.0/glossary.md`.

---

## Memory Core

The overall capability of Atlas v2: a locally-stored, persistent representation of a project that an AI coding agent can draw on. Built up in phases — the Project Tree is its first and current component.

---

## Project Tree

The structural memory built in Milestone 1: the discovered directories, files, and declared dependencies of a scanned workspace, stored locally in SQLite.

---

## Extension Host

The VS Code process the Atlas extension runs inside. All scanning, storage, and UI rendering for v0.1 happens here — there is no separate server process.

---

## Workspace

The project folder currently open in VS Code that Atlas scans when enabled. Milestone 1 supports a single workspace at a time.

---

## `.atlas/` Folder

The per-project folder Atlas creates inside the workspace to hold its local state, including `memory.db`. Should be gitignored by default; it is not part of the project's source.
