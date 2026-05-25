import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserResponse } from "@/types";

// TODO refactor slice, when login / logout is implemented
interface AuthState {
    user: UserResponse | null;
    status: "idle" | "loading" | "failed";
}

const initialState: AuthState = {
    user: null,
    status: "idle",
};

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
});

export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;
