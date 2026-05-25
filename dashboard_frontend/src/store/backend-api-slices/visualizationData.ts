import { backendAPI } from "@/store/backend-api";

/** Endpoints for fetching visualization page data. */
const visualizationDataApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
        /** Fetch data for a visualization by slug. */
        getVisualizationData: builder.query<unknown[], string>({
            query: (slug) => `/api/visualization-data/${slug}`,
        }),
    }),
});

export const { useGetVisualizationDataQuery } = visualizationDataApi;
