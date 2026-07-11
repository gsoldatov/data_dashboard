import { backendAPI } from "@/store/backend-api";
import { dagListResponseSchema, type DagListResponse } from "@/types/backend/responses/airflow";
import type { DagUpdate } from "@/types/backend/requests/airflow";
import { validateResponseData } from "@/store/util";


const airflowApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
        getDags: builder.query<DagListResponse, { limit: number; offset: number }>({
            serializeQueryArgs: () => "dags",
            queryFn: async ({ limit, offset }, _api, _extraOptions, baseQuery) => {
                const url = "/api/airflow/dags";
                const result = await baseQuery({
                    url,
                    params: { limit, offset },
                });
                if (result.error) {
                    return { error: result.error };
                }
                const parsed = validateResponseData(
                    result.data,
                    dagListResponseSchema,
                    url,
                );
                if ("error" in parsed) return parsed;
                return { data: parsed.data };
            },
        }),

        updateDag: builder.mutation<
            void,
            { dag_id: string; body: DagUpdate }
        >({
            queryFn: async ({ dag_id, body }, api, _extraOptions, baseQuery) => {
                const result = await baseQuery({
                    url: `/api/airflow/dags/${dag_id}`,
                    method: "PATCH",
                    body,
                });
                if (result.error) {
                    return { error: result.error };
                }
                api.dispatch(
                    airflowApi.util.updateQueryData(
                        "getDags",
                        "dags" as unknown as { limit: number; offset: number },
                        (draft) => {
                            const dag = draft.dags.find(
                                (d) => d.dag_id === dag_id,
                            );
                            if (dag) {
                                dag.is_paused = body.is_paused;
                            }
                        },
                    ),
                );
                return { data: undefined };
            },
        }),
    }),
});

export const { useGetDagsQuery, useUpdateDagMutation } = airflowApi;
