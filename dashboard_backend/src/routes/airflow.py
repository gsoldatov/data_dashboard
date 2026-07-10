"""Airflow admin routes (ETL monitoring and control)."""

from typing import Any

from fastapi import APIRouter, Depends, Query, Request

from dashboard_backend.src.models.airflow import DagStatus
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
    _admin: User = Depends(admin_user),
    airflow: AirflowServiceProtocol = Depends(get_airflow_service),
) -> dict[str, Any]:
    """Return paginated DAGs with latest-run status."""
    dags, total = await airflow.get_dags(limit, offset)
    return {"dags": dags, "total": total, "limit": limit, "offset": offset}
