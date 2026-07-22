# Atlas v2 — Project Vision

## Status

Draft

---

# Project Name

Atlas Memory Core

---

# Project Goal

Give any AI coding agent a persistent memory of a software project, so understanding survives even when the agent's own context window resets.

A developer enables Atlas on a project once. From that point on, Atlas continuously builds and maintains a local, structured memory of the project — starting with its structure, and growing over time to include its history and meaning. Any AI coding agent working in that project should be able to draw on that memory instead of rediscovering the project from scratch every session.

---

# Product Shape

Atlas v2 is delivered first as a **VS Code extension**, installed and enabled per project. It runs entirely on the developer's machine. There is no server to deploy and no account required.

This is a deliberate change from v1 (Atlas as a hosted web platform). v1 remains a separate, frozen track — tagged `v1.0.0` / `v1.1.0` — kept for a possible future paid/hosted product. v2 is not a rebuild of v1; it is a different product with a different delivery model, built from scratch.

---

# Why This, Why Now

Software project knowledge is fragmented and gets re-derived constantly — this problem statement carries over unchanged from v1. What changes is who consumes the knowledge: not a human browsing a web dashboard, but an AI coding agent that needs project context injected directly into its working session, repeatedly, without the developer re-explaining the project every time.

The sharpest, most concrete pain this solves: an agent's context window fills up or resets, and all accumulated understanding of the project is lost. Atlas exists to hold that understanding outside the agent's context, so it can be reloaded instead of rebuilt.

---

# Roadmap (Phased, One Milestone at a Time)

Atlas v2 is built in strict phases. Each phase must be proven before the next begins. Do not design or implement a later phase while an earlier one is in progress.

1. **Project Tree (Milestone 1 — current focus)**
   Build a structural memory of the project: directories, files, and declared dependencies, stored locally. This is the memory backbone everything else attaches to.

2. **Git History**
   Enrich the memory with project history mined from git — commits, authorship, change frequency. Not designed yet.

3. **Vector Embeddings**
   Add semantic memory over the codebase so an agent can retrieve relevant context by meaning, not just structure. Not designed yet.

4. **Agent Exposure**
   Define how an AI coding agent actually consumes this memory during a session (e.g. a generated context file, a VS Code Language Model Tool, or another bridge). Not designed yet — deliberately deferred until the memory itself is proven trustworthy.

---

# Principles (Carried Forward From v1)

## Facts Before Intelligence

Atlas stores structured facts first. Anything generated (summaries, embeddings, inferred relationships) is derived from stored facts, never a replacement for them.

## Simplicity First

Use the smallest set of components required for the current milestone. No server process, no external database, no dependency the developer has to install or run separately, for as long as that remains true.

## Dogfood First

Before asking whether users can use this, the standard is whether the builder can use it and trust it. Milestone 1's success criteria is a dogfood test, not a feature checklist: can the memory it builds be visually verified as accurate on a real project.

---

# Development Approach

Unchanged from v1: humans own product, architecture, scope, and prioritization decisions. Implementation agents execute assigned tasks against approved docs and must not expand scope or invent requirements. See `agents/workflow.md` and `agents/startup.md`.

---

# Current Phase

Phase 1: Project Tree (Memory Core)

See `docs/v2/milestone-1.md` for the concrete scope.

---

# Rule

Build only what is required for the current milestone. Do not design or implement git-history mining, embeddings, or agent exposure until Milestone 1 is complete and reviewed.
