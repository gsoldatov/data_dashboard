import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

/** Base URL for the dashboard backend API. */
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:14002";

/** Root RTK Query API slice shared by all endpoint injections. */
export const api = createApi({
    reducerPath: "api",
    baseQuery: fetchBaseQuery({
        baseUrl: BACKEND_URL,
        credentials: "include",
    }),
    tagTypes: ["User", "VisualizationSettings"],
    endpoints: () => ({}),
});
