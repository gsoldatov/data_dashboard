import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface UIState {
    redirectOnRender: string;
}

const initialState: UIState = {
    redirectOnRender: "",
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        setRedirectOnRender(state, action: PayloadAction<string>) {
            state.redirectOnRender = action.payload;
        },
    },
});

export const { setRedirectOnRender } = uiSlice.actions;

export default uiSlice.reducer;
