"""Airflow REST API service for querying DAG and task run data."""

from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, cast

import httpx
from fastapi import Request
from pydantic import BaseModel, ValidationError

from dashboard_backend.src.models.airflow import (
    AirflowAuthTokenResponse,
    AirflowDagCollectionResponse,
    AirflowDagRunCollectionResponse,
    AirflowDagRunResponse,
    DagStatus,
)
from dashboard_backend.src.util.exceptions import (
    AirflowUnavailableException,
    ApplicationException,
    InternalValidationException,
    NotFoundException,
)
from python_common.src.config import Config


class AirflowServiceProtocol(ABC):
    """Contract for the Airflow API service (enables test mocking)."""

    @abstractmethod
    async def get_dags(self, limit: int, offset: int) -> tuple[list[DagStatus], int]:
        """Return *(dags, total_entries)* for the given page."""

    @abstractmethod
    async def close(self) -> None:
        """Release resources held by the service (e.g. httpx client)."""


class AirflowService(AirflowServiceProtocol):
    """Communicates with Airflow's REST API using admin credentials."""

    def __init__(self, config: Config) -> None:
        self._config = config
        self._client: httpx.AsyncClient | None = None
        self._token: str | None = None

    # ── client management ──────────────────────────────────────────────

    @property
    def _base_url(self) -> str:
        return f"http://{self._config.airflow_host}:{self._config.airflow_port}"

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(base_url=self._base_url)
        return self._client

    async def close(self) -> None:
        if self._client is not None:
            await self._client.aclose()
            self._client = None

    # ── authentication ─────────────────────────────────────────────────

    async def _authenticate(self) -> str:
        """Obtain a JWT from Airflow and cache it."""
        body = {
            "username": self._config.airflow_admin_username,
            "password": self._config.airflow_admin_password,
        }
        try:
            response = await self.client.post("/auth/token", json=body)
        except (httpx.ConnectError, httpx.TimeoutException) as exc:
            raise AirflowUnavailableException(
                f"Airflow API server is unreachable at {self._base_url}"
            ) from exc

        if response.status_code == 401:
            raise ApplicationException(
                "Airflow authentication failed — check admin credentials"
            )
        if not response.is_success:
            raise ApplicationException(
                f"Airflow auth returned unexpected status {response.status_code}"
            )

        token_data = AirflowAuthTokenResponse.model_validate(response.json())
        self._token = token_data.access_token
        return self._token

    # ── low-level HTTP ─────────────────────────────────────────────────

    async def _request(
        self,
        method: str,
        path: str,
        json: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Make an authenticated request to Airflow and return parsed JSON."""
        headers: dict[str, str] = {}
        if self._token is not None:
            headers["Authorization"] = f"Bearer {self._token}"

        async def _send() -> httpx.Response:
            try:
                return await self.client.request(
                    method, path, headers=headers, json=json
                )
            except (httpx.ConnectError, httpx.TimeoutException) as exc:
                raise AirflowUnavailableException(
                    f"Airflow API server is unreachable at {self._base_url}"
                ) from exc

        response = await _send()

        # Auto-refresh token on 401, then retry once
        if response.status_code == 401:
            await self._authenticate()
            headers["Authorization"] = f"Bearer {self._token}"
            response = await _send()

        if response.status_code == 404:
            raise NotFoundException(f"Airflow resource not found: {method} {path}")

        if not response.is_success:
            raise ApplicationException(
                f"Airflow API returned {response.status_code} for {method} {path}"
            )

        return response.json()  # type: ignore[no-any-return]

    async def _request_parsed[T: BaseModel](
        self,
        method: str,
        path: str,
        model_class: type[T],
        json: dict[str, Any] | None = None,
    ) -> T:
        """Make an authenticated request and validate the response
        with *model_class*.
        """
        data = await self._request(method, path, json=json)
        try:
            return model_class.model_validate(data)
        except ValidationError as exc:
            raise InternalValidationException(str(exc)) from exc

    # ── public methods ─────────────────────────────────────────────────

    async def get_dags(
        self, limit: int, offset: int
    ) -> tuple[list[DagStatus], int]:
        """Return paginated DAGs with their latest-run status merged in."""
        # 1. Fetch DAGs from Airflow
        dag_path = (
            f"/api/v2/dags?limit={limit}&offset={offset}&order_by=dag_id"
        )
        dag_collection = await self._request_parsed(
            "GET", dag_path, AirflowDagCollectionResponse
        )
        dag_list = dag_collection.dags
        total = dag_collection.total_entries

        if not dag_list:
            return [], total

        dag_ids = sorted({d.dag_id for d in dag_list})

        # 2. Batch-fetch latest dag runs for the requested DAGs
        latest_runs: dict[str, AirflowDagRunResponse] = {}

        while len(latest_runs) < len(dag_ids):
            remaining_ids = [d for d in dag_ids if d not in latest_runs]
            run_collection = await self._request_parsed(
                "POST",
                "/api/v2/dags/~/dagRuns/list",
                AirflowDagRunCollectionResponse,
                json={
                    "dag_ids": remaining_ids,
                    "page_limit": 200,
                    "page_offset": 0,
                    "order_by": "-start_date",
                },
            )

            if not run_collection.dag_runs:
                break

            for run in run_collection.dag_runs:
                if run.dag_id in latest_runs:
                    continue
                latest_runs[run.dag_id] = run

        # 3. Merge into DagStatus
        results: list[DagStatus] = []
        for dag in dag_list:
            dag_id = dag.dag_id
            latest_run: AirflowDagRunResponse | None = latest_runs.get(dag_id)
            results.append(
                DagStatus(
                    dag_id=dag_id,
                    description=dag.description,
                    is_paused=dag.is_paused,
                    timetable_summary=dag.timetable_summary,
                    next_dagrun=(
                        dag.next_dagrun_run_after.isoformat()
                        if dag.next_dagrun_run_after
                        else None
                    ),
                    last_run_state=latest_run.state if latest_run else None,
                    last_run_start_date=(
                        latest_run.start_date.isoformat()
                        if latest_run and latest_run.start_date
                        else None
                    ),
                    has_import_errors=dag.has_import_errors,
                    dashboard_url=f"{self._base_url}/dags/{dag_id}",
                )
            )

        return results, total


def get_airflow_service(request: Request) -> AirflowServiceProtocol:
    """FastAPI dependency that returns the Airflow service from app state."""
    return cast(AirflowServiceProtocol, request.app.state.airflow_service)
