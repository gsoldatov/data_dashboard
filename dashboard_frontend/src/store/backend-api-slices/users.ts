import { backendAPI } from "@/store/backend-api";
import type { User } from "@/types/user";
import type { UserUpdateRequest } from "@/types/backend/requests/users";
import { authApi } from "@/store/backend-api-slices/auth";

/** Endpoints for user operations. */
const usersApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
        /** Update the current user's own profile data. */
        updateCurrentUser: builder.mutation<
            User,
            { userId: number; body: UserUpdateRequest }
        >({
            queryFn: async ({ userId, body }, api, _extraOptions, baseQuery) => {
                const result = await baseQuery({
                    url: `/api/users/${userId}`,
                    method: "PATCH",
                    body,
                });
                if (result.error) {
                    return { error: result.error };
                }
                api.dispatch(
                    authApi.util.updateQueryData(
                        "getCurrentUser",
                        undefined,
                        () => result.data as User,
                    ),
                );
                return { data: result.data as User };
            },
        }),
    }),
});

export const {
    useUpdateCurrentUserMutation,
} = usersApi;
