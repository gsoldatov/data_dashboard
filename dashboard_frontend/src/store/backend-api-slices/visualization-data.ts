import { backendAPI } from "@/store/backend-api";
import { visualizationDataResponseValidatorMap } from "@/types/visualization-data/visualization-data";
import { validateResponseData } from "@/store/util";

type VisualizationDataset = unknown[];

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
                // Validate response data with the correct validator
                const schema =
                    visualizationDataResponseValidatorMap[slug];
                if (!schema) {
                    console.error(
                        `No response validator found for visualization slug "${slug}". ` +
                            "Add a Zod schema to visualizationDataResponseValidatorMap.",
                    );
                    return {
                        error: {
                            status: "CUSTOM_ERROR",
                            error: `Missing response validator for "${slug}".`,
                            data: result.data,
                        },
                    };
                }
                const parsed = validateResponseData(
                    result.data,
                    schema,
                    url,
                );
                if ("error" in parsed) return parsed;
                return { data: parsed.data as VisualizationDataset[] };
            },
        }),
    }),
});

export const { useGetVisualizationDataQuery } = visualizationDataApi;
