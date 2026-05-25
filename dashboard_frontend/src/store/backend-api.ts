import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getDocumentApp } from "@/util/document-app";

/** Root RTK Query API slice shared by all endpoint injections. */
export const backendAPI = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: getDocumentApp().config.backendUrl,
        credentials: "include",
    }),
    tagTypes: ["User", "VisualizationSettings"],
    endpoints: () => ({}),
});
