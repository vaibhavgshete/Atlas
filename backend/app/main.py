from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from psycopg import Connection

from app.config import settings
from app.database import connection_scope, initialize_database
from app.models import ErrorBody, ErrorResponse, Project, ProjectCreate
from app.repository import ProjectRepository


@asynccontextmanager
async def lifespan(_: FastAPI):
    if not settings.skip_db_init:
        initialize_database()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_connection_dependency() -> Connection:
    with connection_scope() as connection:
        yield connection


def get_repository(connection: Connection = Depends(get_connection_dependency)) -> ProjectRepository:
    return ProjectRepository(connection)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, __: RequestValidationError) -> JSONResponse:
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content=ErrorResponse(
            error=ErrorBody(
                code="VALIDATION_ERROR",
                message="Required fields are missing.",
            )
        ).model_dump(),
    )


@app.post(
    "/api/projects",
    response_model=Project,
    status_code=status.HTTP_201_CREATED,
)
def create_project(
    payload: ProjectCreate,
    repository: ProjectRepository = Depends(get_repository),
) -> Project:
    return repository.create_project(payload)


@app.get("/api/projects", response_model=list[Project])
def list_projects(repository: ProjectRepository = Depends(get_repository)) -> list[Project]:
    return repository.list_projects()


@app.get(
    "/api/projects/{project_id}",
    response_model=Project,
    responses={404: {"model": ErrorResponse}},
)
def get_project(
    project_id: str,
    repository: ProjectRepository = Depends(get_repository),
) -> Project:
    project = repository.get_project(project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorBody(code="PROJECT_NOT_FOUND", message="Project not found.").model_dump(),
        )
    return project


@app.delete(
    "/api/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={404: {"model": ErrorResponse}},
)
def delete_project(
    project_id: str,
    repository: ProjectRepository = Depends(get_repository),
) -> Response:
    deleted = repository.delete_project(project_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=ErrorBody(code="PROJECT_NOT_FOUND", message="Project not found.").model_dump(),
        )
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    if isinstance(exc.detail, dict) and "code" in exc.detail and "message" in exc.detail:
        payload = {"error": exc.detail}
    else:
        payload = {
            "error": {
                "code": "HTTP_ERROR",
                "message": str(exc.detail),
            }
        }
    return JSONResponse(status_code=exc.status_code, content=payload)


@app.get("/healthz")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}
