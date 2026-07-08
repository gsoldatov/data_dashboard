import { backendAPI } from "@/store/backend-api";
import { datasetValidatorMap } from "@/types/visualization-data/visualization-data";
import { validateResponseData } from "@/store/util";
import type { RootState } from "@/store";

/** Endpoints for fetching visualization datasets. */
const visualizationDataApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
        /** Fetch a single dataset by name.  Data is pre-populated by
         *  getVisualizationDatasets via upsertQueryData; the query function
         *  serves as a fallback when the dataset is not already cached. */
        getVisualizationDataset: builder.query<unknown[], string>({
            async queryFn(name, _api, _extraOptions, baseQuery) {
                const url = `/api/visualization-data/?datasets=${name}`;
                const result = await baseQuery(url);
                if (result.error) {
                    return { error: result.error };
                }

                const schema = datasetValidatorMap[name];
                if (!schema) {
                    console.error(
                        `No validator for dataset "${name}". Add it to datasetValidatorMap.`,
                    );
                    return {
                        error: {
                            status: "CUSTOM_ERROR",
                            error: `No validator for dataset "${name}".`,
                        },
                    };
                }

                const response = result.data as Record<string, unknown[]>;
                const validated = validateResponseData(
                    response[name],
                    schema,
                    url,
                );
                if ("error" in validated) {
                    return validated;
                }

                return { data: validated.data as unknown[] };
            },
        }),

        /** Bulk-fetch datasets by name.  Filters out already-cached datasets,
         *  fetches the rest, validates them, and upserts each into the
         *  getVisualizationDataset cache slot.  A single missing validator
         *  or validation failure fails the entire fetch.
         *  Returns no data itself — temporary cache entry (keepUnusedDataFor: 0). */
        getVisualizationDatasets: builder.query<null, string[]>({
            async queryFn(
                datasetNames,
                { getState, dispatch },
                _extraOptions,
                baseQuery,
            ) {
                const state = getState() as RootState & {
                    api?: {
                        queries?: Record<string, { status?: string }>;
                    };
                };

                const missingNames = datasetNames.filter((name) => {
                    const key = `getVisualizationDataset("${name}")`;
                    return state.api?.queries?.[key]?.status !== "fulfilled";
                });

                if (missingNames.length === 0) {
                    return { data: null };
                }

                const url = `/api/visualization-data/?datasets=${missingNames.join(",")}`;
                const result = await baseQuery(url);
                if (result.error) {
                    return { error: result.error };
                }

                const response = result.data as Record<string, unknown[]>;
                const parsedData: Record<string, unknown[]> = {};

                for (const name of missingNames) {
                    const schema = datasetValidatorMap[name];
                    if (!schema) {
                        console.error(
                            `No validator for dataset "${name}". Add it to datasetValidatorMap.`,
                        );
                        return {
                            error: {
                                status: "CUSTOM_ERROR",
                                error: `No validator for dataset "${name}".`,
                            },
                        };
                    }
                    const validated = validateResponseData(
                        response[name],
                        schema,
                        url,
                    );
                    if ("error" in validated) {
                        return validated;
                    }
                    parsedData[name] = validated.data as unknown[];
                }

                for (const [name, data] of Object.entries(parsedData)) {
                    dispatch(
                        visualizationDataApi.util.upsertQueryData(
                            "getVisualizationDataset",
                            name,
                            data,
                        ),
                    );
                }

                return { data: null };
            },
            keepUnusedDataFor: 0,
        }),
    }),
});

export const {
    useGetVisualizationDatasetQuery,
    useGetVisualizationDatasetsQuery,
} = visualizationDataApi;
