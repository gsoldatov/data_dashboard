import { backendAPI } from "@/store/backend-api";
import type {
    BatchVisualizationSettingsResponse,
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

        /** Check whether visualizations are published. */
        getIsPublished: builder.query<
            BatchVisualizationSettingsResponse,
            { slugs: string[]; settings: string[] }
        >({
            query: ({ slugs, settings }) => ({
                url: "/api/visualization-settings/",
                params: {
                    settings: settings.join(","),
                    slugs: slugs.join(","),
                },
            }),
        }),
    }),
});

export const {
    useUpsertVisualizationSettingsMutation,
    useGetIsPublishedQuery,
} = visualizationSettingsApi;
