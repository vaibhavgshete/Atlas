# Atlas Milestone 1

Atlas Milestone 1 provides a minimal three-component foundation for project
management:

* `frontend`: static project management UI served by Nginx
* `backend`: FastAPI service with PostgreSQL persistence
* `postgres`: database for project storage

## Local Development

Run the full stack with Docker Compose:

```bash
docker compose up --build
```

Services:

* Frontend: `http://localhost:8080`
* Backend: `http://localhost:8000`

## Backend Tests

```bash
set PYTHONPATH=backend
python -m pytest backend/tests
```

## Helm

The deployment chart is in `helm/atlas`.
