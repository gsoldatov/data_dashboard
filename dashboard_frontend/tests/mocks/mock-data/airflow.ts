import type { DagStatus, DagListResponse } from "@/types/backend/responses/airflow";


const SAMPLE_STATES = ["success", "failed", "running", "success", null];

export function generateMockDags(count: number): DagStatus[] {
    let dagCounter = 0;
    const dags: DagStatus[] = [];
    for (let i = 0; i < count; i++) {
        dagCounter++;
        dags.push({
            dag_id: `dag_${String(dagCounter).padStart(3, "0")}`,
            description: `Description for DAG ${dagCounter}`,
            is_paused: i % 3 === 0,
            timetable_summary: i % 2 === 0 ? "Every 5 minutes" : "Daily at midnight",
            next_dagrun: i % 4 === 0 ? null : "2026-07-11T00:00:00Z",
            last_run_state: SAMPLE_STATES[i % SAMPLE_STATES.length],
            last_run_start_date: i % 5 === 0 ? null : "2026-07-10T12:00:00Z",
        });
    }
    return dags;
}

export function createMockDagListResponse(
    limit: number,
    offset: number,
    total: number = 25,
): DagListResponse {
    const allDags = generateMockDags(total);
    return {
        dags: allDags.slice(offset, offset + limit),
        total,
        limit,
        offset,
    };
}
