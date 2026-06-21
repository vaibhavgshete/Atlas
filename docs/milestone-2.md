# Atlas Milestone 2

## Status

Planned

---

# Milestone Name

Repository Scanning Foundation

---

# Objective

Introduce repository scanning capabilities to Atlas.

This milestone establishes the foundation required for future repository analysis and knowledge generation.

Atlas should be able to retrieve a repository, execute a scan, track scan status, and preserve scan history.

No repository intelligence or knowledge generation will be performed during this milestone.

---

# User Goal

A user should be able to initiate a repository scan and view scan history for a project.

---

# User Workflow

## Start Scan

User opens a project.

User clicks:

Start Scan

Atlas creates a new scan and begins repository processing.

---

## View Scan Status

User can view the current scan status.

Example statuses:

* Pending
* Running
* Completed
* Failed

---

## View Scan History

User can view previous scans executed for a project.

Example:

* Scan #1 - Completed
* Scan #2 - Completed
* Scan #3 - Failed

---

# Functional Requirements

## Scan Creation

Atlas shall allow users to create a repository scan for a project.

Each scan must be associated with exactly one project.

---

## Repository Retrieval

Atlas shall retrieve repository contents using the repository URL associated with the project.

Repository retrieval may be implemented using local cloning or another approved mechanism.

---

## Scan Status Tracking

Atlas shall track scan execution state.

Supported states:

* Pending
* Running
* Completed
* Failed

---

## Scan History

Atlas shall preserve all scan executions.

Users must be able to view historical scan records.

---

## Scan Details

Atlas shall display:

* Scan ID
* Scan Status
* Created Time
* Completion Time
* Failure Reason (if applicable)

---

# Database Requirements

Milestone 2 introduces the Scan entity.

Suggested attributes:

* ID
* Project ID
* Status
* Started At
* Completed At
* Failure Reason
* Created At

Project entity remains unchanged.

---

# Backend Requirements

Backend shall provide APIs for:

* Create Scan
* Get Scan
* List Project Scans

Backend shall support repository retrieval and scan execution.

---

# Frontend Requirements

Frontend shall provide:

## Start Scan Action

Available from the Project Details page.

---

## Scan History View

Displays all scans associated with a project.

---

## Scan Details View

Displays detailed information about an individual scan.

---

# Out of Scope

The following capabilities are explicitly excluded:

* Dependency extraction
* File analysis
* Directory analysis
* Fact extraction
* Documentation extraction
* AI integration
* Summary generation
* Knowledge graph generation
* Repository understanding
* Change analysis
* Auto-remediation
* Agent execution

---

# Success Criteria

Milestone 2 is complete when:

1. User can initiate a scan.
2. Atlas retrieves repository contents.
3. Atlas creates scan records.
4. Atlas tracks scan status.
5. Atlas preserves scan history.
6. User can view previous scans.
7. Failed scans are recorded correctly.

---

# Deliverables

Frontend:

* Start Scan Action
* Scan History View
* Scan Details View

Backend:

* Scan APIs
* Scan Execution Service
* Repository Retrieval Service

Database:

* Scan Table
* Project-to-Scan Relationship

Deployment:

* Updated Frontend Deployment
* Updated Backend Deployment
* Updated Database Schema

---

# Milestone Outcome

At the completion of Milestone 2, Atlas will be capable of retrieving repositories, executing scans, and preserving scan history.

Atlas will have the infrastructure required for future repository intelligence, but will not yet analyze repository contents.

The primary outcome of this milestone is the creation of a reliable scanning foundation that future milestones can build upon.
