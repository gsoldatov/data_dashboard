import { backendAPI } from "@/store/backend-api";
import type {
    BatchVisualizationSettingsResponse,
} from "@/types";

/** Endpoints for reading visualization settings. */
const visualizationSettingsApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
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
    useGetIsPublishedQuery,
} = visualizationSettingsApi;
