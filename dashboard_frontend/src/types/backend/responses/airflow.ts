import { z } from "zod";

export const dagStatusSchema = z.object({
    dag_id: z.string(),
    description: z.string().nullable(),
    is_paused: z.boolean(),
    timetable_summary: z.string().nullable(),
    next_dagrun: z.string().nullable(),
    last_run_state: z.string().nullable(),
    last_run_start_date: z.string().nullable(),
});

export type DagStatus = z.infer<typeof dagStatusSchema>;

export const dagListResponseSchema = z.object({
    dags: z.array(dagStatusSchema),
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
});

export type DagListResponse = z.infer<typeof dagListResponseSchema>;
