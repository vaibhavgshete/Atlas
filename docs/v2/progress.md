# Atlas Progress

## Status

Living document. Updated whenever a milestone opens or closes — see `agents/project-manager.md` for ownership.

This is an index, not a duplicate of the detailed docs. For scope/requirements detail, read the linked milestone doc. For implementation detail, read the linked tasks.

---

# Active Track: Atlas Memory Core (v2)

| # | Milestone | Status | Summary |
|---|-----------|--------|---------|
| 1 | [Memory Core: Project Tree](milestone-1.md) | **Completed** | Local VS Code extension: workspace scan, `package.json`/`requirements.txt` dependency parsing, SQLite storage (`.atlas/memory.db`), sidebar Tree View. No git history, embeddings, or agent exposure yet — by design. |
| 2 | Git History | Not started | Enrich memory with commit history, authorship, change frequency. Not yet scoped. |
| 3 | Vector Embeddings | Not started | Semantic memory over the codebase for meaning-based retrieval. Not yet scoped. |
| 4 | Agent Exposure | Not started | Define how an AI coding agent actually consumes this memory during a session. Not yet scoped — deliberately deferred until the memory core is proven trustworthy. |

Full roadmap and reasoning: [`project-vision.md`](project-vision.md).

## Milestone 1 detail

Tasks: [TASK-006](../../tasks/completed/task-006-extension-scaffold-and-workspace-scanner.md) (scaffold + scanner) → [TASK-007](../../tasks/completed/task-007-dependency-parsing-and-sqlite-storage.md) (dependencies + storage) → [TASK-008](../../tasks/completed/task-008-tree-view-sidebar-panel.md) (sidebar view) → [TASK-009](../../tasks/completed/task-009-milestone-1-scope-and-e2e-review.md) (milestone review, Approved).

Verified end-to-end against two independent real-world projects in the actual Extension Development Host, plus headless verification of the scanner/parser/storage logic and an independent source-level scope audit (no network calls, no shell execution, no writes outside `.atlas/`).

Known non-blocking limitation: scanning a folder with no local `.gitignore` of its own can surface build-artifact noise (e.g. `__pycache__`), since the scanner only reads a `.gitignore` at the scanned root. Left as-is; revisit only if it becomes a real problem.

---

# Frozen Track: Atlas Web Platform (v1)

Hosted project-management web platform (frontend + FastAPI backend + PostgreSQL), deployable via Docker Compose or the Helm chart. Milestone 1 (project CRUD) is complete; Milestone 2 (repository scanning) was scoped but not built before the pivot to v2. Not under active development — kept as a possible future paid/hosted product, tagged `v1.0.0`/`v1.1.0`.

Docs: [`docs/v1.0/`](../v1.0/).
