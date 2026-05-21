import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import type { UserResponse } from "../../types";

interface AuthState {
  user: UserResponse | null;
  status: "idle" | "loading" | "failed";
}

const initialState: AuthState = {
  user: null,
  status: "idle",
};

/**
 * TODO: Replace with GET /api/auth/me when backend endpoint is available.
 * Currently fetches /api/users/1 as a placeholder for the current user.
 */
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (): Promise<UserResponse> => {
    // TODO: replace with /api/auth/me
    const response = await fetch("/api/users/1", {
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Not authenticated");
    }
    return response.json();
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserResponse>) {
      state.user = action.payload;
      state.status = "idle";
    },
    clearUser(state) {
      state.user = null;
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "idle";
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.status = "failed";
      });
  },
});

export const { setUser, clearUser } = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.user !== null;
export const selectIsAdmin = (state: { auth: AuthState }) =>
  state.auth.user?.role === "admin";
export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;

export default authSlice.reducer;
