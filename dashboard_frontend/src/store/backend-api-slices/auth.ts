import { backendAPI, API_TAGS } from "@/store/backend-api";
import type { LoginRequest } from "@/types/backend/requests/auth";
import {
    userResponseSchema,
    type UserResponse,
} from "@/types/backend/responses/auth";
import { validateResponseData } from "@/store/util";

/** Endpoints for authentication (login, logout, current user). */
export const authApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
        /** Fetch the currently authenticated user. 404 → not authenticated. */
        getCurrentUser: builder.query<UserResponse | null, void>({
            queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
                const url = "/api/auth/me";
                const result = await baseQuery(url);
                const meta = result.meta as { response?: { status?: number } } | undefined;
                if (meta?.response?.status === 404) {
                    return { data: null };
                }
                if (result.error) {
                    return { error: result.error };
                }
                const parsed = validateResponseData(
                    result.data,
                    userResponseSchema,
                    url,
                );
                if ("error" in parsed) return parsed;
                return { data: parsed.data };
            },
            providesTags: ["User"],
        }),

        /** Authenticate with username and password, returns the user. */
        login: builder.mutation<UserResponse, LoginRequest>({
            queryFn: async (body, api, _extraOptions, baseQuery) => {
                const result = await baseQuery({
                    url: "/api/auth/login",
                    method: "POST",
                    body,
                });
                if (result.error) {
                    return { error: result.error };
                }
                const parsed = validateResponseData(
                    result.data,
                    userResponseSchema,
                    "/api/auth/login",
                );
                if ("error" in parsed) return parsed;
                api.dispatch(
                    authApi.util.updateQueryData(
                        "getCurrentUser",
                        undefined,
                        () => parsed.data,
                    ),
                );
                // Clear cached anonymous-session data for all non-user tags.
                api.dispatch(
                    authApi.util.invalidateTags(
                        API_TAGS.filter((t) => t !== "User"),
                    ),
                );
                return { data: parsed.data };
            },
        }),

        /** Terminate the current session. */
        logout: builder.mutation<void, void>({
            queryFn: async (_arg, api, _extraOptions, baseQuery) => {
                const result = await baseQuery({
                    url: "/api/auth/logout",
                    method: "POST",
                });
                if (result.error) {
                    return { error: result.error };
                }
                api.dispatch(
                    authApi.util.updateQueryData(
                        "getCurrentUser",
                        undefined,
                        () => null,
                    ),
                );
                return { data: undefined };
            },
        }),
    }),
});

export const {
    useGetCurrentUserQuery,
    useLoginMutation,
    useLogoutMutation,
} = authApi;
