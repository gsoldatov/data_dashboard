import { backendAPI } from "@/store/backend-api";
import type { VisualizationSettingsUpsert } from "@/types/backend/requests/visualization-settings";
import {
    batchVisualizationSettingsSchema,
    visualizationSettingsResponseSchema,
    type BatchVisualizationSettingsResponse,
    type VisualizationSettingsResponse,
} from "@/types/backend/responses/visualization-settings";
import { VISUALIZATIONS } from "@/util/constants";
import { validateResponseData } from "@/store/util";

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
                const parsed = validateResponseData(
                    result.data,
                    visualizationSettingsResponseSchema,
                    `/api/visualization-settings/${slug}`,
                );
                if ("error" in parsed) return parsed;
                return { data: parsed.data };
            },
        }),

        /** Check whether visualizations are published. */
        getIsPublished: builder.query<
            BatchVisualizationSettingsResponse,
            { slugs: string[]; settings: string[] }
        >({
            queryFn: async ({ slugs, settings }, _api, _extraOptions, baseQuery) => {
                const url = "/api/visualization-settings/";
                const result = await baseQuery({
                    url,
                    params: {
                        settings: settings.join(","),
                        slugs: slugs.join(","),
                    },
                });
                if (result.error) {
                    return { error: result.error };
                }
                const parsed = validateResponseData(
                    result.data,
                    batchVisualizationSettingsSchema,
                    url,
                );
                if ("error" in parsed) return parsed;
                return { data: parsed.data };
            },
        }),
    }),
});

export const {
    useUpsertVisualizationSettingsMutation,
    useGetIsPublishedQuery,
} = visualizationSettingsApi;
