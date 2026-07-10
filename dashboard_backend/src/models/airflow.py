"""Models for Airflow API responses and domain-specific data."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict

# ── Airflow API response models (internal, for parsing Airflow JSON) ──────


class AirflowDagResponse(BaseModel):
    """Fields we consume from Airflow's ``GET /api/v2/dags`` response item."""

    model_config = ConfigDict(from_attributes=True)

    dag_id: str
    description: str | None
    is_paused: bool
    timetable_summary: str | None
    next_dagrun_run_after: datetime | None
    has_import_errors: bool


class AirflowDagCollectionResponse(BaseModel):
    """Wrapper for ``GET /api/v2/dags`` response."""

    model_config = ConfigDict(from_attributes=True)

    dags: list[AirflowDagResponse]
    total_entries: int


class AirflowDagRunResponse(BaseModel):
    """Fields we consume from a dag run in ``GET /api/v2/dags/~/dagRuns``."""

    model_config = ConfigDict(from_attributes=True)

    dag_id: str
    dag_run_id: str
    state: str
    start_date: datetime | None
    end_date: datetime | None
    run_type: str


class AirflowDagRunCollectionResponse(BaseModel):
    """Wrapper for ``GET /api/v2/dags/~/dagRuns`` response."""

    model_config = ConfigDict(from_attributes=True)

    dag_runs: list[AirflowDagRunResponse]
    total_entries: int


class AirflowAuthTokenResponse(BaseModel):
    """Response from ``POST /auth/token``."""

    model_config = ConfigDict(from_attributes=True)

    access_token: str


# ── Domain models (returned by our API routes) ────────────────────────────


class DagStatus(BaseModel):
    """Public-facing DAG status returned by ``GET /api/airflow/dags``."""

    dag_id: str
    description: str | None
    is_paused: bool
    timetable_summary: str | None
    next_dagrun: str | None
    last_run_state: str | None
    last_run_start_date: str | None
    has_import_errors: bool
    dashboard_url: str
