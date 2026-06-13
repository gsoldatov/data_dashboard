import { backendAPI } from "@/store/backend-api";
import type { LoginRequest } from "@/types/backend/requests/auth";
import type { User } from "@/types/user";
import { user as userSchema } from "@/types/user";

/** Endpoints for authentication (login, logout, current user). */
export const authApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
        /** Fetch the currently authenticated user. 404 → not authenticated. */
        getCurrentUser: builder.query<User | null, void>({
            queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
                const result = await baseQuery("/api/auth/me");
                const meta = result.meta as { response?: { status?: number } } | undefined;
                if (meta?.response?.status === 404) {
                    return { data: null };
                }
                if (result.error) {
                    return { error: result.error };
                }
                return { data: result.data as User };
            },
            providesTags: ["User"],
        }),

        /** Authenticate with username and password, returns the user. */
        login: builder.mutation<User, LoginRequest>({
            queryFn: async (body, api, _extraOptions, baseQuery) => {
                const result = await baseQuery({
                    url: "/api/auth/login",
                    method: "POST",
                    body,
                });
                if (result.error) {
                    return { error: result.error };
                }
                const parsed = userSchema.safeParse(result.data);
                if (!parsed.success) {
                    console.error(
                        "[auth] login response validation failed:",
                        parsed.error,
                    );
                    return {
                        error: {
                            status: "CUSTOM_ERROR",
                            error: "Failed to log in.",
                        },
                    };
                }
                api.dispatch(
                    authApi.util.updateQueryData(
                        "getCurrentUser",
                        undefined,
                        () => parsed.data,
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
