import { api } from "./base";
import type { LoginRequest, SessionResponse, UserResponse } from "@/types";

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<SessionResponse, LoginRequest>({
      query: (body) => ({
        url: "/api/auth/login",
        method: "POST",
        body,
      }),
    }),
    /** TODO: replace with GET /api/auth/me when backend endpoint is available */
    getCurrentUser: builder.query<UserResponse, number>({
      query: (userId) => `/api/users/${userId}`,
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
    }),
  }),
});

export const { useLoginMutation, useGetCurrentUserQuery, useLogoutMutation } =
  authApi;
