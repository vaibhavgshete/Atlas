from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1)
    repositoryUrl: str = Field(min_length=1)
    description: str | None = None


class Project(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    name: str
    repositoryUrl: str
    description: str | None = None
    createdAt: datetime
    updatedAt: datetime


class ErrorBody(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorBody
