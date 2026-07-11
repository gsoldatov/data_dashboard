import { backendAPI } from "@/store/backend-api";
import { dagListResponseSchema, type DagListResponse } from "@/types/backend/responses/airflow";
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
    }),
});

export const { useGetDagsQuery } = airflowApi;
