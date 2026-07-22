# Atlas Requirements Document v0.1

## Status

Draft

---

# Purpose

Define the initial requirements for Atlas before any architecture or development work begins.

This document focuses only on what the system must achieve.

Implementation details, technology choices, service design, and deployment architecture are intentionally excluded.

---

# Problem Statement

Software project knowledge is fragmented across multiple sources such as source code, documentation, and repository structure.

Developers often spend significant time understanding a project before they can begin meaningful work.

Knowledge is repeatedly rediscovered rather than preserved.

Atlas aims to create a persistent knowledge layer that helps users understand software projects faster.

---

# Vision

Atlas will become the knowledge and memory layer for software systems.

The platform will continuously collect information, build understanding, preserve knowledge, and provide project context.

Future capabilities may include operational intelligence and automated remediation, but those capabilities are outside the scope of the initial version.

---

# Scope of Version 0.1

Atlas v0.1 focuses only on repository understanding.

Input:

* Single Git repository

Output:

* Generated project understanding

Atlas does not modify repositories.

Atlas does not perform remediation.

Atlas does not perform autonomous development.

Atlas does not execute operational actions.

---

# Supported Repository Model

Version 0.1 supports:

* Single repository projects

Version 0.1 does not support:

* Multi-repository projects
* Cross-project dependency analysis

---

# Primary User Story

As a developer,

I want to connect a repository to Atlas,

So that Atlas can generate an understanding of the project and help me learn how the project is structured.

---

# User Workflow

1. Create Project
2. Provide Repository URL
3. Start Repository Scan
4. Atlas Processes Repository
5. Atlas Generates Knowledge
6. User Views Generated Understanding

---

# Functional Requirements

## Repository Ingestion

Atlas shall:

* Accept a repository URL
* Retrieve repository contents
* Process repository structure

---

## Repository Analysis

Atlas shall:

* Identify files
* Identify directories
* Identify project dependencies
* Identify repository metadata

---

## Knowledge Generation

Atlas shall generate:

* Project overview
* Project structure summary
* Dependency summary
* Repository summary

---

## Knowledge Storage

Atlas shall store:

* Repository information
* Extracted facts
* Generated knowledge

---

# Source of Truth Strategy

Atlas shall store:

1. Raw extracted facts
2. Generated knowledge

Generated knowledge should be derived from stored facts whenever possible.

This ensures future features can reuse existing information without requiring complete rescans.

---

# Initial Knowledge Entities

Version 0.1 will support the following entities only:

## Project

Represents a repository being analyzed.

---

## Directory

Represents repository folders.

---

## File

Represents repository files.

---

## Dependency

Represents project dependencies discovered during analysis.

---

## Generated Summary

Represents generated understanding and documentation.

---

# Out of Scope

The following capabilities are intentionally excluded from Version 0.1:

* Kubernetes analysis
* Helm analysis
* CI/CD analysis
* Monitoring integrations
* Incident management
* Agent systems
* Autonomous development
* Auto-remediation
* Multi-repository understanding
* Knowledge graphs
* Code modification
* Pull request creation

---

# Success Criteria

Atlas v0.1 is considered successful when:

1. A user can connect a repository.
2. Atlas can analyze the repository.
3. Atlas can extract basic project information.
4. Atlas can generate a useful project summary.
5. A new developer can understand the project faster using the generated knowledge.

---

# Development Principle

Requirements first.

Architecture second.

Implementation third.

The system should remain as simple as possible until a clear need for additional complexity exists.
