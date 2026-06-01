import { backendAPI } from "@/store/backend-api";
import type {
    VisualizationSettingsResponse,
    VisualizationSettingsUpsert,
} from "@/types";

/** Endpoints for reading and updating visualization settings. */
const visualizationSettingsApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
        /** Fetch publish settings for a visualization by slug. */
        // getVisualizationSettings: builder.query<
        //     VisualizationSettingsResponse,
        //     string
        // >({
        //     query: (slug) => `/api/visualization-settings/${slug}`,
        //     providesTags: (_result, _error, slug) => [
        //         { type: "VisualizationSettings", id: slug },
        //     ],
        // }),

        /** Create or update publish settings for a visualization. */
        upsertVisualizationSettings: builder.mutation<
            VisualizationSettingsResponse,
            { slug: string; body: VisualizationSettingsUpsert }
        >({
            query: ({ slug, body }) => ({
                url: `/api/visualization-settings/${slug}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: (_result, _error, { slug }) => [
                { type: "VisualizationSettings", id: slug },
            ],
        }),

        /** Check whether a visualization is published. */
        getIsPublished: builder.query<string, string>({
            query: (slug) => ({
                url: `/api/visualization-settings/${slug}/is-published`,
                responseHandler: "text",
            }),
        }),
    }),
});

export const {
    useUpsertVisualizationSettingsMutation,
    useGetIsPublishedQuery,
} = visualizationSettingsApi;
