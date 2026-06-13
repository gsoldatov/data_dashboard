import { backendAPI } from "@/store/backend-api";
import type {
    BatchVisualizationSettingsResponse,
    VisualizationSettingsResponse,
    VisualizationSettingsUpsert,
} from "@/types";
import { VISUALIZATIONS } from "@/util/constants";

/** Endpoints for reading and updating visualization settings. */
const visualizationSettingsApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
        /** Create or update publish settings for a visualization. */
        upsertVisualizationSettings: builder.mutation<
            VisualizationSettingsResponse,
            { slug: string; body: VisualizationSettingsUpsert }
        >({
            queryFn: async ({ slug, body }, api, _extraOptions, baseQuery) => {
                const result = await baseQuery({
                    url: `/api/visualization-settings/${slug}`,
                    method: "PUT",
                    body,
                });
                if (result.error) {
                    return { error: result.error };
                }
                const slugs = VISUALIZATIONS.map((v) => v.slug);
                api.dispatch(
                    visualizationSettingsApi.util.updateQueryData(
                        "getIsPublished",
                        { slugs, settings: ["is-published"] },
                        (draft) => {
                            draft[slug] = { is_published: body.is_published };
                        },
                    ),
                );
                return { data: result.data as VisualizationSettingsResponse };
            },
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
