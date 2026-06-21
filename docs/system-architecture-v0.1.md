# Atlas System Architecture v0.1

## Status

Draft

---

# Purpose

Define the high-level system architecture for Atlas Version 0.1.

This document describes:

* System components
* Responsibilities
* Data flow
* System boundaries
* Deployment model

This document intentionally avoids low-level implementation details.

---

# Architecture Goals

Atlas v0.1 should:

* Accept a repository URL
* Analyze a repository
* Extract project facts
* Generate project knowledge
* Store historical scans
* Present generated knowledge to users

The architecture should remain simple and easy to evolve.

---

# Architectural Principles

## Simplicity First

The system should use the smallest number of components required to satisfy current requirements.

Avoid introducing complexity for future features.

---

## Clear Responsibilities

Each component should have a single primary responsibility.

---

## Facts Before Intelligence

Atlas should first extract structured facts.

Generated knowledge should be derived from stored facts.

---

## Preserve History

All scans should be retained.

Historical data is considered a core platform capability.

---

# System Components

## Frontend

### Responsibility

User interaction.

### Capabilities

* Create projects
* View projects
* Start scans
* View scan history
* View generated summaries

### Exclusions

Frontend does not perform repository analysis.

Frontend does not access repositories directly.

---

## Backend API

### Responsibility

Application orchestration and business logic.

### Capabilities

* Manage projects
* Manage scans
* Clone repositories
* Execute repository analysis
* Generate project knowledge
* Store and retrieve data

### Exclusions

Backend does not modify repositories.

Backend does not perform automated remediation.

---

## PostgreSQL

### Responsibility

Persistent storage.

### Stored Data

* Projects
* Scans
* Directories
* Files
* Dependencies
* Generated summaries

### Exclusions

PostgreSQL is not used for source control.

Repository contents are not permanently stored.

---

# Logical Architecture

User interacts with Atlas through the frontend.

The frontend communicates with the backend.

The backend performs repository analysis and stores results in PostgreSQL.

```text
User
  |
  v
Frontend
  |
  v
Backend API
  |
  +---- Repository Scanner
  |
  +---- Summary Generator
  |
  v
PostgreSQL
```

---

# Repository Analysis Flow

## Step 1

User creates a project.

---

## Step 2

User provides a repository URL.

---

## Step 3

Backend creates a new scan record.

---

## Step 4

Backend retrieves repository contents.

---

## Step 5

Backend scans repository structure.

Collected information includes:

* Directories
* Files
* Dependencies
* Documentation

---

## Step 6

Extracted information is stored as structured facts.

---

## Step 7

Atlas generates project summaries using collected facts.

---

## Step 8

Generated knowledge is stored.

---

## Step 9

Results become available through the frontend.

---

# Data Flow

```text
Repository URL
       |
       v
Create Scan
       |
       v
Clone Repository
       |
       v
Extract Facts
       |
       v
Store Facts
       |
       v
Generate Summary
       |
       v
Store Summary
       |
       v
Display Results
```

---

# Initial Data Model

## Project

Represents a tracked repository.

Relationship:

```text
Project
  |
  +---- Multiple Scans
```

---

## Scan

Represents a single repository analysis execution.

Relationship:

```text
Scan
  |
  +---- Directories
  +---- Files
  +---- Dependencies
  +---- Summaries
```

---

## Directory

Represents a discovered repository directory.

---

## File

Represents a discovered repository file.

---

## Dependency

Represents a discovered project dependency.

---

## Summary

Represents generated project knowledge.

Examples:

* Project Overview
* Structure Summary
* Dependency Summary

---

# Deployment Architecture

Atlas v0.1 consists of three deployable components.

```text
atlas-frontend
atlas-backend
postgres
```

Deployment target:

* Kubernetes

Packaging:

* Helm Chart

---

# System Boundaries

Atlas will:

* Read repositories
* Analyze repositories
* Generate knowledge
* Preserve scan history

Atlas will not:

* Modify repositories
* Create pull requests
* Deploy applications
* Perform remediation
* Execute operational changes

---

# Future Extension Points

The architecture should allow future addition of:

* Kubernetes analysis
* Helm analysis
* CI/CD analysis
* Incident tracking
* Knowledge graph generation
* Operational intelligence
* Automated remediation

These capabilities are intentionally excluded from Version 0.1.

---

# Success Criteria

The architecture is considered successful when:

1. A repository can be analyzed.
2. Facts can be extracted.
3. Knowledge can be generated.
4. Historical scans are preserved.
5. Users can understand a project through Atlas.

---

# Architecture Summary

Atlas v0.1 is a simple three-component system:

* Frontend
* Backend API
* PostgreSQL

The platform focuses on repository understanding and knowledge generation.

No autonomous actions are performed.

The architecture prioritizes simplicity, maintainability, and future extensibility.
