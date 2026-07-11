"""Airflow admin routes (ETL monitoring and control)."""

from typing import Any

from fastapi import APIRouter, Depends, Query, Request, Response

from dashboard_backend.src.models.airflow import DagStatus, DagUpdate
from dashboard_backend.src.models.user import User
from dashboard_backend.src.services.airflow import (
    AirflowServiceProtocol,
    get_airflow_service,
)
from dashboard_backend.src.services.auth import admin_user

router = APIRouter(tags=["airflow"])


@router.get("/dags")
async def list_dags(
    request: Request,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    dag_id_pattern: str | None = Query(None),
    _admin: User = Depends(admin_user),
    airflow: AirflowServiceProtocol = Depends(get_airflow_service),
) -> dict[str, Any]:
    """Return paginated DAGs with latest-run status.  Optionally filter
    by *dag_id_pattern* (case-insensitive substring match on ``dag_id``).
    """
    dags, total = await airflow.get_dags(limit, offset, dag_id_pattern)
    return {"dags": dags, "total": total, "limit": limit, "offset": offset}


@router.patch("/dags/{dag_id}")
async def update_dag(
    dag_id: str,
    update: DagUpdate,
    _admin: User = Depends(admin_user),
    airflow: AirflowServiceProtocol = Depends(get_airflow_service),
) -> Response:
    """Patch a DAG (e.g. pause / unpause)."""
    await airflow.update_dag(dag_id, update)
    return Response(status_code=204)
