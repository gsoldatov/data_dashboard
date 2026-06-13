import { backendAPI } from "@/store/backend-api";
import type { User } from "@/types/user";
import type { UserUpdateRequest } from "@/types/backend/requests/users";
import { authApi } from "@/store/backend-api-slices/auth";

interface UserCreate {
    username: string;
    password: string;
    role: "admin" | "viewer";
}

/** Endpoints for user CRUD operations (admin only). */
const usersApi = backendAPI.injectEndpoints({
    endpoints: (builder) => ({
        /** Fetch a single user by ID. */
        // getUser: builder.query<User, number>({
        //     query: (userId) => `/api/users/${userId}`,
        //     providesTags: (_result, _error, userId) => [
        //         { type: "User", id: userId },
        //     ],
        // }),

        /** Create a new user. */
        createUser: builder.mutation<User, UserCreate>({
            query: (body) => ({
                url: "/api/users",
                method: "POST",
                body,
            }),
            invalidatesTags: ["User"],
        }),

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

        /** Delete a user. */
        deleteUser: builder.mutation<void, number>({
            query: (userId) => ({
                url: `/api/users/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["User"],
        }),
    }),
});

export const {
    useCreateUserMutation,
    useUpdateCurrentUserMutation,
    useDeleteUserMutation,
} = usersApi;
