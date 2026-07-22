# Atlas Extension — Code Structure

This describes what's actually implemented, as of Milestone 1. For product vision and the roadmap, see [`docs/v2/project-vision.md`](../docs/v2/project-vision.md). For the *planned* architecture and data model, see [`docs/v2/system-architecture-v2.0.md`](../docs/v2/system-architecture-v2.0.md). This file only documents this folder's actual source.

## Files

| File | Responsibility |
|---|---|
| `src/scanner.ts` | Walks a workspace, respecting `.gitignore` plus a small built-in ignore list (`.git`, `node_modules`, `.atlas`). Returns an in-memory `ScanEntry[]`. |
| `src/dependencies.ts` | Parses `package.json` and `requirements.txt` manifests found anywhere in the scan results (not just the workspace root) into `ManifestDependency[]`. |
| `src/storage.ts` | The only code that touches `.atlas/memory.db`. `replaceMemory()` writes a scan (full delete-then-insert per table, in one transaction). `readMemory()` reads it back — called fresh on every use, never cached, so the tree view can't drift from what's actually on disk. Uses `sql.js` (WASM), not a native binding — see the note below. |
| `src/treeView.ts` | `AtlasMemoryProvider implements vscode.TreeDataProvider`. Calls `readMemory()` on every expand and renders directories/files as a real nested tree (via `parent_path`), plus a synthetic "Dependencies" group. |
| `src/extension.ts` | The only file that imports `vscode`'s command/window APIs directly. Contains no business logic of its own — `activate()` registers the `atlas.enable` command and the tree view, and the command handler just calls the other four modules in sequence: scan → extract dependencies → store → refresh the view. |

## Dependency direction

```text
extension.ts
    │
    ├──> scanner.ts        (no dependency on anything else in this project)
    ├──> dependencies.ts   (no dependency on anything else in this project)
    ├──> storage.ts        (no dependency on anything else in this project)
    └──> treeView.ts  ──>  storage.ts  (reads via readMemory())
```

`scanner.ts`, `dependencies.ts`, and `storage.ts` don't import `vscode` at all. That's deliberate: it means they're testable with plain `node`, outside the extension host, without any VS Code test harness. `extension.ts` and `treeView.ts` do import `vscode`, so they can only be exercised by actually running the extension (F5 → Extension Development Host).

## Why `sql.js` instead of a native SQLite binding

A native module like `better-sqlite3` compiles against the system Node ABI at `npm install` time — not the Electron/Node runtime VS Code's extension host actually runs on. That mismatch needs a separate `electron-rebuild` step to fix, which adds a real toolchain dependency. `sql.js` is WASM, so there's no ABI to mismatch — it runs identically under any Node or Electron build. Given Milestone 1's row counts (low thousands at most), the performance difference is irrelevant; correctness and simplicity won by a wide margin.

## Data model

Implemented exactly as specified in `docs/v2/system-architecture-v2.0.md`:

* `directories(path, parent_path)`
* `files(path, parent_path, extension)`
* `dependencies(name, version, source_manifest)`

No additional columns. Every scan replaces all three tables' contents entirely — there is no upsert/merge logic.

## Adding a new module

Follow the existing pattern: if it doesn't need `vscode`, don't import it — keep it headlessly testable. Wire it into `extension.ts` as a new step, not by reaching into `scanner.ts`/`dependencies.ts`/`storage.ts` from inside another module.
