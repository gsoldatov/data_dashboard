import { backendAPI } from "@/store/backend-api";
import type { UserResponse } from "@/types/backend/responses/auth";
import { userResponseSchema } from "@/types/backend/responses/auth";
import type { UserUpdateRequest } from "@/types/backend/requests/users";
import { authApi } from "@/store/backend-api-slices/auth";
import { validateResponseData } from "@/store/util";

/** Endpoints for user operations. */
const usersApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
        /** Update the current user's own profile data. */
        updateCurrentUser: builder.mutation<
            UserResponse,
            { userId: number; body: UserUpdateRequest }
        >({
            queryFn: async ({ userId, body }, api, _extraOptions, baseQuery) => {
                const url = `/api/users/${userId}`;
                const result = await baseQuery({
                    url,
                    method: "PATCH",
                    body,
                });
                if (result.error) {
                    return { error: result.error };
                }
                const parsed = validateResponseData(result.data, userResponseSchema, url);
                if ("error" in parsed) return parsed;
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
    }),
});

export const {
    useUpdateCurrentUserMutation,
} = usersApi;
