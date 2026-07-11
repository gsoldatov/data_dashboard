/** Request body for PATCH /api/airflow/dags/{dag_id}. */
export interface DagUpdate {
    is_paused: boolean;
}
