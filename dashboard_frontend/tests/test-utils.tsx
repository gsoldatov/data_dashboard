import { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/auth";
import { api } from "@/store/api/base";
import type { RootState } from "@/store";


interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
    preloadedState?: Partial<RootState>;
    initialEntries?: string[];
}


/**
 * Test rendering function with custom memory router.
 * 
 * Allows passing preloaded Redux state & router history.
 */
export const renderWithProviders = (
    ui: ReactElement,
    {
        preloadedState,
        initialEntries = ["/"],
        ...renderOptions
    }: RenderWithProvidersOptions = {},
) => {
    const store = configureStore({
        reducer: {
            auth: authReducer,
            [api.reducerPath]: api.reducer,
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().concat(api.middleware),
        preloadedState: preloadedState as RootState,
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <Provider store={store}>
                <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
            </Provider>
        );
    }

    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};
