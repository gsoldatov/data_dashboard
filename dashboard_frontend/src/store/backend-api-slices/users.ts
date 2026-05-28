import { backendAPI } from "@/store/backend-api";
import type { User } from "@/types/user";

interface UserCreate {
    username: string;
    password: string;
    role: "admin" | "viewer";
}

interface UserUpdate {
    username?: string;
    password?: string;
    role?: "admin" | "viewer";
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

        /** Update an existing user. */
        updateUser: builder.mutation<
            User,
            { userId: number; body: UserUpdate }
        >({
            query: ({ userId, body }) => ({
                url: `/api/users/${userId}`,
                method: "PATCH",
                body,
            }),
            invalidatesTags: (_result, _error, { userId }) => [
                { type: "User", id: userId },
            ],
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
    useUpdateUserMutation,
    useDeleteUserMutation,
} = usersApi;
