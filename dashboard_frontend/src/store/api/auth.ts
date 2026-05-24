import { api } from "./base";
import type { LoginRequest, SessionResponse, UserResponse } from "@/types";

/** Endpoints for authentication (login, logout, current user). */
export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /** Authenticate with username and password, returns a session. */
        login: builder.mutation<SessionResponse, LoginRequest>({
            query: (body) => ({
                url: "/api/auth/login",
                method: "POST",
                body,
            }),
        }),
        /**
         * Fetch the currently authenticated user.
         *
         * TODO: replace with GET /api/auth/me when backend endpoint is available.
         */
        getCurrentUser: builder.query<UserResponse, number>({
            query: (userId) => `/api/users/${userId}`,
        }),
        /** Terminate the current session. */
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
