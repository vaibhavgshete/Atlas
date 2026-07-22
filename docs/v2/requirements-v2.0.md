# Atlas v2 Requirements Document

## Status

Draft

---

# Purpose

Define the requirements for Atlas v2 (Memory Core) before architecture or implementation work begins. This document covers only what the system must achieve for the current milestone. Technology choices beyond what's already decided (VS Code extension, SQLite) and detailed design are covered in `docs/v2/system-architecture-v2.0.md`.

---

# Problem Statement

AI coding agents lose accumulated project understanding whenever their context window fills up or resets. Developers end up re-explaining the same project structure, conventions, and context repeatedly across sessions. Existing project knowledge (structure, dependencies, history) exists but isn't captured anywhere an agent can reliably reload it from.

---

# Vision

Atlas becomes a persistent, local memory layer for a software project that any AI coding agent can draw on. See `docs/v2/project-vision.md` for the full roadmap. This document scopes only the first milestone: the structural project tree.

---

# Scope of v0.1 (Milestone 1: Project Tree)

Input:

* A single VS Code workspace (project folder) opened by the developer

Output:

* A locally stored, structural representation of that project: directories, files, and declared dependencies
* A way for the developer to visually inspect that representation inside VS Code

Atlas v0.1 does not modify the project. Atlas v0.1 does not expose memory to any AI agent yet. Atlas v0.1 does not mine git history or generate embeddings.

---

# Primary User Story

As a developer using VS Code,

I want to enable Atlas on my project,

So that Atlas builds an accurate, locally-stored map of my project's structure that I can verify is correct — the foundation a future AI-agent memory feature will be built on.

---

# User Workflow

1. Install the Atlas extension
2. Open a project (workspace) in VS Code
3. Run "Enable Atlas" for the project
4. Atlas scans the workspace and builds the project tree
5. Atlas stores the tree locally
6. Developer views the tree in a sidebar panel and confirms it's accurate

---

# Functional Requirements

## Workspace Scanning

Atlas shall:

* Scan the currently open VS Code workspace
* Identify directories
* Identify files
* Identify dependency manifests present in the project (e.g. `package.json`, `requirements.txt`) and extract declared dependencies from them

---

## Tree Construction

Atlas shall build a structural tree representing:

* Directory hierarchy
* Files within each directory
* Declared dependencies associated with the project

---

## Local Storage

Atlas shall persist the constructed tree in a local SQLite database file within the workspace (e.g. `.atlas/memory.db`).

Atlas shall not require any external database, server process, or network account to function.

---

## Tree Verification View

Atlas shall provide a way, inside VS Code, for the developer to view the constructed tree and confirm it accurately reflects the project.

---

## Re-scan

Atlas shall allow the developer to manually re-run the scan to refresh the stored tree.

---

# Source of Truth Strategy

Atlas shall store raw structural facts (directories, files, dependencies) as the source of truth. Any future generated or derived memory (summaries, embeddings, git-derived context) must be built from these stored facts, not replace them. This principle carries forward unchanged from v1.

---

# Initial Memory Entities (v0.1)

## Directory

Represents a folder within the scanned workspace.

## File

Represents a file within the scanned workspace.

## Dependency

Represents a dependency declared in a recognized manifest file.

---

# Out of Scope

Explicitly excluded from v0.1:

* Git history mining
* Vector embeddings / semantic search
* Exposing memory to any AI coding agent
* Multi-root / multi-repository workspaces
* Any cloud sync, account, or login
* Authentication or access control
* Modifying project files
* Automated remediation or code generation

---

# Success Criteria

Atlas v0.1 (Milestone 1) is considered successful when:

1. A developer can enable Atlas on a real project from inside VS Code.
2. Atlas scans the workspace without manual configuration.
3. Atlas produces a directory/file/dependency tree stored locally in SQLite.
4. The developer can view the tree inside VS Code and confirm it matches the real project structure.
5. The scan can be re-run and reflects changes made to the project.

---

# Development Principle

Requirements first. Architecture second. Implementation third. One milestone at a time — do not design or build git history mining, embeddings, or agent exposure as part of this milestone.
