# Atlas Milestone 1

## Status

Completed

---

# Milestone Name

Project Management Foundation

---

# Objective

Build the foundational platform that allows users to create and manage projects inside Atlas.

This milestone establishes the basic application structure and validates end-to-end communication between:

* Frontend
* Backend
* Database

No repository analysis will be performed during this milestone.

---

# User Goal

A user should be able to register a repository as a project and manage that project through the Atlas interface.

---

# User Workflow

## Create Project

User provides:

* Project Name
* Repository URL
* Description

Atlas stores the project.

---

## View Projects

User can view all existing projects.

---

## View Project Details

User can open an individual project and view stored information.

---

## Delete Project

User can delete a project.

---

# Functional Requirements

## Project Creation

Atlas shall allow users to create a project.

Required fields:

* Project Name
* Repository URL

Optional fields:

* Description

---

## Project Listing

Atlas shall display all existing projects.

---

## Project Details

Atlas shall display details for a selected project.

---

## Project Deletion

Atlas shall allow deletion of a project.

---

# Database Requirements

Milestone 1 introduces the Project entity.

Suggested attributes:

* ID
* Name
* Repository URL
* Description
* Created At
* Updated At

No additional entities are required during this milestone.

---

# Backend Requirements

Backend shall provide APIs for:

* Create Project
* Get Project
* List Projects
* Delete Project

Repository scanning APIs are excluded.

---

# Frontend Requirements

Frontend shall provide:

## Project List Page

Displays all projects.

---

## Create Project Page

Allows creation of a new project.

---

## Project Details Page

Displays project information.

---

# Out of Scope

The following capabilities are explicitly excluded:

* Repository cloning
* Repository scanning
* Fact extraction
* Dependency detection
* Documentation generation
* AI integration
* Summary generation
* Scan history
* Authentication
* User management
* Role-based access control

---

# Success Criteria

Milestone 1 is complete when:

1. User can create a project.
2. User can view projects.
3. User can view project details.
4. User can delete a project.
5. Data persists in PostgreSQL.
6. Frontend communicates successfully with Backend APIs.
7. Application can be deployed through the defined architecture.

---

# Deliverables

Frontend:

* Project List Page
* Create Project Form
* Project Details Page

Backend:

* Project CRUD APIs

Database:

* Project Table

Deployment:

* Frontend Deployment
* Backend Deployment
* PostgreSQL Deployment
* Helm Chart

---

# Milestone Outcome

At the completion of Milestone 1, Atlas will have a fully functioning application foundation capable of managing projects.

This milestone establishes the base platform on which repository scanning and knowledge generation features will be built in future milestones.
