# Atlas v2 Milestone 1

## Status

Planned

---

# Milestone Name

Memory Core: Project Tree

---

# Objective

Build the foundational VS Code extension that scans a project workspace and constructs a locally-stored structural project tree — directories, files, and declared dependencies. This is the memory backbone that later milestones (git history, embeddings, agent exposure) will build on.

No AI agent integration happens in this milestone. No git history or semantic analysis happens in this milestone.

---

# User Goal

A developer should be able to enable Atlas on a real project, trigger a scan, and visually confirm that the resulting project tree accurately reflects the project's structure.

---

# User Workflow

## Enable Atlas

Developer opens a project in VS Code and runs the "Enable Atlas" command.

---

## Scan Project

Atlas scans the workspace and builds the project tree.

---

## View Project Tree

Developer opens the Atlas sidebar view and inspects the discovered directories, files, and dependencies.

---

## Re-scan

Developer can re-run the scan after making changes to the project and see the tree update.

---

# Functional Requirements

## Extension Activation

Atlas shall register an "Enable Atlas" command available from the command palette.

---

## Workspace Scan

Atlas shall scan the open workspace's directory and file structure, respecting `.gitignore`.

---

## Dependency Detection

Atlas shall detect recognized dependency manifest files present in the workspace (starting with `package.json` and `requirements.txt`) and extract declared dependencies from them.

---

## Local Storage

Atlas shall persist the scanned tree in a local SQLite database at `.atlas/memory.db` within the workspace.

---

## Tree View

Atlas shall provide a sidebar view in VS Code displaying the stored directory/file/dependency tree.

---

## Re-scan

Atlas shall allow the developer to manually trigger a re-scan, replacing previously stored tree data with the current scan's results.

---

# Database Requirements

Milestone 1 introduces three entities, stored locally in SQLite (no hosted database):

* Directory — `path`, `parent_path`
* File — `path`, `parent_path`, `extension`
* Dependency — `name`, `version`, `source_manifest`

---

# Extension Requirements

The extension shall provide:

## Enable / Scan Command

Triggers a workspace scan.

## Tree View Panel

Displays the current stored project tree in the VS Code sidebar.

---

# Out of Scope

The following capabilities are explicitly excluded from Milestone 1:

* Git history mining
* Vector embeddings / semantic search
* Exposing memory to any AI coding agent
* Multi-root or multi-repository workspaces
* Cloud sync, accounts, or login
* Authentication or access control
* File content storage or code analysis beyond structure/dependencies
* Automatic background scanning (scans are manually triggered in this milestone)

---

# Success Criteria

Milestone 1 is complete when:

1. Developer can enable Atlas on a real VS Code project.
2. Atlas scans the workspace and builds a directory/file/dependency tree.
3. The tree is stored locally in SQLite and persists across VS Code restarts.
4. Developer can view the tree in a sidebar panel and confirm it matches the real project.
5. Developer can re-scan and see the tree reflect changes made to the project.
6. No excluded capability (git history, embeddings, agent exposure, network access) was implemented.

---

# Deliverables

Extension:

* VS Code extension scaffold
* "Enable Atlas" / "Scan Project" command
* Workspace scanner (directories, files, `.gitignore`-aware)
* Dependency manifest parser (starting with `package.json`, `requirements.txt`)
* SQLite storage layer (`.atlas/memory.db`)
* Sidebar Tree View for verification

---

# Milestone Outcome

At the completion of Milestone 1, Atlas will be a working, installable VS Code extension that can be enabled on any project and produce a trustworthy, locally-stored structural memory of that project. This is the foundation on which git-history mining, semantic embeddings, and AI-agent memory exposure will be built in future milestones.
