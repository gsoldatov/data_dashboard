import { z } from "zod";
import { backendAPI } from "@/store/backend-api";
import { russiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";
import { validateResponseData } from "@/store/util";

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";

type VisualizationDataset = RussiaStateBudgetItem[];

const russiaStateBudgetResponseSchema = z.array(z.array(russiaStateBudgetItem));

/** Endpoints for fetching visualization page data. */
const visualizationDataApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
        /** Fetch data for a visualization by slug. */
        getVisualizationData: builder.query<VisualizationDataset[], string>({
            queryFn: async (slug, _api, _extraOptions, baseQuery) => {
                const url = `/api/visualization-data/${slug}`;
                const result = await baseQuery(url);
                if (result.error) {
                    return { error: result.error };
                }
                if (slug === "russia_state_budget") {
                    const parsed = validateResponseData(
                        result.data,
                        russiaStateBudgetResponseSchema,
                        url,
                    );
                    if ("error" in parsed) return parsed;
                    return { data: parsed.data };
                }
                return { data: result.data as VisualizationDataset[] };
            },
        }),
    }),
});

export const { useGetVisualizationDataQuery } = visualizationDataApi;
