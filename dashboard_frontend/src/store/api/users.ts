import { api } from "./base";
import type { UserResponse } from "@/types";

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

export const usersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUser: builder.query<UserResponse, number>({
      query: (userId) => `/api/users/${userId}`,
      providesTags: (_result, _error, userId) => [{ type: "User", id: userId }],
    }),
    createUser: builder.mutation<UserResponse, UserCreate>({
      query: (body) => ({
        url: "/api/users",
        method: "POST",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateUser: builder.mutation<
      UserResponse,
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
  useGetUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApi;
