import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
    useDispatch,
    useSelector,
    type TypedUseSelectorHook,
} from "react-redux";
import uiReducer from "./slices/ui";
import { backendAPI } from "./backend-api";

const rootReducer = combineReducers({
    ui: uiReducer,
    [backendAPI.reducerPath]: backendAPI.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createStore(preloadedState?: Partial<RootState>) {
    return configureStore({
        reducer: rootReducer,
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(backendAPI.middleware),
        preloadedState,
    });
}

export const store = createStore();

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
