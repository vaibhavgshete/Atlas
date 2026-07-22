# Atlas

Atlas is building a memory layer for software projects. This repository currently contains two tracks:

## Atlas Memory Core (`extension/`) — active development

A local VS Code extension that gives an AI coding agent persistent memory of a project — structure, dependencies, and (in future milestones) history and semantic context — so understanding survives an agent's context resets. Runs entirely locally: no server, no account.

See [`extension/README.md`](extension/README.md) for setup and usage, and [`docs/v2/`](docs/v2/) for the vision, requirements, and architecture.

## Atlas Web Platform (`frontend/`, `backend/`, `helm/`) — frozen, tagged `v1.0.0`/`v1.1.0`

A hosted project-management web platform: project CRUD, PostgreSQL persistence, deployable via Docker Compose or the Helm chart. Not under active development — kept as a possible future paid/hosted product. See [`docs/v1.0/`](docs/v1.0/) for its docs.

### Local Development

Run the full stack with Docker Compose:

```bash
docker compose up --build
```

Services:

* Frontend: `http://localhost:8080`
* Backend: `http://localhost:8000`

### Backend Tests

```bash
set PYTHONPATH=backend
python -m pytest backend/tests
```

### Helm

The deployment chart is in `helm/atlas`.
