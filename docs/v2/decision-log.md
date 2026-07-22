# Atlas v2 Decision Log

## Purpose

This document records important product and architectural decisions made for Atlas v2 (Memory Core). It is a fresh log, separate from `docs/v1.0/decision-log.md`, which remains the historical record for v1's decisions.

**Owner:** Architect Agent is responsible for writing and maintaining ADR entries.

---

## ADR-001

Date: 2026-07-22

Decision:
Atlas v1 (project management web platform) is frozen as-is, tagged `v1.0.0` / `v1.1.0`, and kept as a separate possible future paid/hosted product. Atlas v2 is a new, separate product direction and is not a continuation or rebuild of v1.

Reason:
v1 and v2 solve different problems for different consumers (a hosted dashboard for humans vs. local memory for AI coding agents) and have fundamentally different delivery models (Kubernetes-deployed web app vs. local VS Code extension). Keeping them separate avoids forcing one architecture to serve two unrelated goals.

Status:
Accepted

---

## ADR-002

Date: 2026-07-22

Decision:
Atlas v2 will be delivered first as a VS Code extension, not a standalone server or MCP server.

Reason:
Simplicity and dogfood-ability: a VS Code extension installs directly into the developer's existing workflow with no server to run, no Docker, and no account. It is the fastest path to a version the builder can actually use daily and trust. Broader agent access (via MCP, generated context files, or another bridge) is deferred to a later milestone once the memory core itself is proven.

Status:
Accepted

---

## ADR-003

Date: 2026-07-22

Decision:
Atlas v2 will store memory locally in a SQLite database file within the workspace (`.atlas/memory.db`), not a hosted database.

Reason:
No external database, server process, or account is required for the extension to function. This matches the local-only, install-and-it-works goal for v2 and avoids reintroducing the Postgres/Docker dependency that v1 needed for its hosted use case.

Status:
Accepted

---

## ADR-004

Date: 2026-07-22

Decision:
Atlas v2 Milestone 1 scope is limited to a structural project tree (directories, files, declared dependencies) only. Git history mining, vector embeddings, and exposing memory to an AI agent are explicitly deferred to later, separately-scoped milestones.

Reason:
One milestone at a time. The structural tree is the memory backbone every later capability depends on; proving it can be built accurately and trusted (dogfood test) is a prerequisite for building anything on top of it. Designing later milestones now risks locking in assumptions before the foundation is validated.

Status:
Accepted
