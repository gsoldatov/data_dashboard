import { api } from "./base";

/** Endpoints for fetching visualization page data. */
export const visualizationDataApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /** Fetch data for a visualization by slug. */
        getVisualizationData: builder.query<unknown[], string>({
            query: (slug) => `/api/visualization-data/${slug}`,
        }),
    }),
});

export const { useGetVisualizationDataQuery } = visualizationDataApi;
