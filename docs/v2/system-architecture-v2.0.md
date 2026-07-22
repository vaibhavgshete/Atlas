# Atlas v2 System Architecture

## Status

Draft

---

# Purpose

Define the architecture for Atlas v2 Milestone 1 (Project Tree). Covers components, responsibilities, data flow, and system boundaries for this milestone only. Later milestones (git history, embeddings, agent exposure) will each get an architecture update when they're scoped — this document does not design them in advance.

---

# Architecture Goals

Atlas v0.1 should:

* Run entirely inside the developer's VS Code, on the developer's machine
* Scan an open workspace and build a structural project tree
* Persist that tree locally, with no external server or account
* Let the developer view and verify the tree inside the editor

---

# Architectural Principles

## Single Component

Milestone 1 is one deployable unit: the VS Code extension. No backend service, no hosted database. This is a sharper version of v1's "simplicity first" principle — v1 had three components (frontend, backend, database) because it was a hosted web platform; v2 has one because it isn't.

## Local-Only

All scanning, processing, and storage happens on the developer's machine, inside the workspace. Nothing leaves the machine in this milestone.

## Facts Before Intelligence

The extension extracts structured facts (directories, files, dependencies) first. No summarization, inference, or generation happens in Milestone 1.

## Extend, Don't Redesign

The extension's internals should be structured so that git-history mining, embeddings, and agent exposure can be added as new modules writing into the same SQLite store later, without requiring a rewrite of the scanner or storage layer. This does not mean building hooks or abstractions for those features now — it means not painting the scanner into a corner (e.g. not hardcoding storage to only ever hold three fixed tables).

---

# System Components (Milestone 1)

## VS Code Extension

### Responsibility

Everything: user interaction, scanning, tree construction, storage, and the verification view.

### Capabilities

* Register an "Enable Atlas" / "Scan Project" command
* Walk the workspace file tree, respecting `.gitignore`
* Parse recognized dependency manifests (e.g. `package.json`, `requirements.txt`) found during the walk
* Write directories, files, and dependencies into a local SQLite database
* Provide a sidebar Tree View rendering the stored structure for developer verification
* Support re-scanning on demand

### Exclusions

* Does not call any external network service
* Does not expose data to any other extension or process
* Does not modify any file in the workspace other than its own `.atlas/` storage folder

---

## Local Storage (SQLite)

### Responsibility

Persist the scanned project tree between VS Code sessions.

### Location

`.atlas/memory.db` inside the workspace root.

### Stored Data (Milestone 1)

* Directories (path, parent)
* Files (path, parent directory, basic metadata such as size/extension)
* Dependencies (name, version if declared, source manifest)

### Exclusions

* Not used to store file contents — only structural facts about them
* Not a source-control mechanism; `.atlas/` should be gitignored by default

---

# Logical Architecture

```text
Developer
   |
   v
VS Code Extension
   |
   +---- Workspace Scanner
   |
   +---- Tree Builder
   |
   +---- Tree View (sidebar)
   |
   v
SQLite (.atlas/memory.db)
```

---

# Scan Flow

## Step 1

Developer runs "Enable Atlas" (or "Scan Project") from the command palette or sidebar.

## Step 2

Extension walks the workspace, respecting `.gitignore` and a small built-in ignore list (e.g. `node_modules`, `.git`).

## Step 3

Extension records each directory and file encountered.

## Step 4

Extension recognizes known dependency manifest files during the walk and parses declared dependencies from them.

## Step 5

Extension writes the collected directories, files, and dependencies into `.atlas/memory.db`, replacing the previous scan's data.

## Step 6

Extension refreshes the sidebar Tree View from the newly stored data.

---

# Initial Data Model

## Directory

* `path` (relative to workspace root)
* `parent_path`

## File

* `path` (relative to workspace root)
* `parent_path`
* `extension`

## Dependency

* `name`
* `version` (nullable)
* `source_manifest` (e.g. `package.json`)

No relationships beyond parent/child directory nesting and manifest-to-dependency association are modeled in Milestone 1.

---

# Deployment Architecture

Atlas v0.1 is distributed as a single VS Code extension package (`.vsix` / VS Code Marketplace listing). There is no server component and nothing to deploy to infrastructure. This is a deliberate contrast with v1, which required Docker Compose and a Helm chart for Kubernetes.

---

# System Boundaries

Atlas v0.1 will:

* Read files within the open workspace
* Build and store a structural project tree locally
* Display that tree to the developer

Atlas v0.1 will not:

* Modify project files
* Access the network
* Expose data to other tools, extensions, or AI agents
* Store file contents or source code

---

# Future Extension Points

Not designed in this document — noted only so Milestone 1's storage layer doesn't accidentally block them:

* Git history ingestion (commits, authorship, change frequency) as additional data alongside the structural tree
* Vector embeddings over file/code content for semantic retrieval
* A bridge exposing the stored memory to an AI coding agent's context (mechanism undecided — could be a generated context file, a VS Code Language Model Tool, an MCP server, or another approach)

---

# Success Criteria

The architecture is considered successful when:

1. The extension can scan a real workspace and produce an accurate tree.
2. The tree is persisted locally in SQLite and survives a VS Code restart.
3. The developer can view and trust the tree via the sidebar view.
4. The storage schema doesn't need to be thrown away to add git history or embeddings later.

---

# Architecture Summary

Atlas v0.1 is a single-component system: a VS Code extension that scans a workspace and stores a structural project tree in local SQLite. No server, no account, no network access. The architecture prioritizes simplicity and a working, verifiable local memory core before any AI-facing capability is added.
