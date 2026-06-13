import {
    createApi,
    fetchBaseQuery,
    type BaseQueryFn,
} from "@reduxjs/toolkit/query/react";
import { getDocumentApp } from "@/util/document-app";
import { setRedirectOnRender } from "@/store/slices/ui";

interface QueriesState {
    queries: Record<string, { data?: unknown } | undefined>;
}

const rawBaseQuery = fetchBaseQuery({
    baseUrl: getDocumentApp().config.backendUrl,
    credentials: "include",
    timeout: 10000
});

const customBaseQuery: BaseQueryFn = async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);

    const url = typeof args === "string" ? args : (args as { url?: string }).url ?? "";
    const method = typeof args === "string" ? "" : (args as { method?: string }).method ?? "";

    // Skip X-Is-Authenticated check for login and logout
    if (method === "POST" && (url === "/api/auth/login" || url === "/api/auth/logout")) {
        return result;
    }

    // Check if the session has expired while we still have cached user data
    const isAuth = result.meta?.response?.headers.get("x-is-authenticated");
    if (isAuth === "false") {
        const state = api.getState() as { api?: QueriesState };
        const userCache = state.api?.queries?.["getCurrentUser(undefined)"]?.data;
        if (userCache !== null && userCache !== undefined) {
            api.dispatch(setRedirectOnRender("/login"));
            api.dispatch({ type: "api/resetApiState" });
        }
    }

    return result;
};

/** All tag types used by the RTK Query API. Used by both the API config and cache invalidation. */
export const API_TAGS = ["User", "VisualizationSettings"] as const;

/** Root RTK Query API slice shared by all endpoint injections. */
export const backendAPI = createApi({
    reducerPath: "api",
    baseQuery: customBaseQuery,
    tagTypes: API_TAGS,
    endpoints: () => ({}),
});
