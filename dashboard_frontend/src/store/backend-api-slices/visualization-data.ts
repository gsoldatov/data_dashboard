import { z } from "zod";
import { backendAPI } from "@/store/backend-api";
import { russiaGdpItem } from "@/types/visualization-data/russia-gdp";
import { russiaInflationResponseSchema } from "@/types/visualization-data/russia-inflation";
import { russiaLaborMarketResponseSchema } from "@/types/visualization-data/russia-labor-market";
import { russiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";
import { validateResponseData } from "@/store/util";

type VisualizationDataset = unknown[];

const schemaBySlug: Record<string, z.ZodType> = {
    russia_gdp: z.array(z.array(russiaGdpItem)),
    russia_state_budget: z.array(z.array(russiaStateBudgetItem)),
    russia_labor_market: russiaLaborMarketResponseSchema,
    russia_inflation: russiaInflationResponseSchema,
};

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
                const schema = schemaBySlug[slug];
                if (schema) {
                    const parsed = validateResponseData(
                        result.data,
                        schema,
                        url,
                    );
                    if ("error" in parsed) return parsed;
                    return { data: parsed.data as VisualizationDataset[] };
                }
                return { data: result.data as VisualizationDataset[] };
            },
        }),
    }),
});

export const { useGetVisualizationDataQuery } = visualizationDataApi;
