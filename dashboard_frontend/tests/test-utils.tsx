import { type ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter, useLocation, type Location } from "react-router-dom";
import { Provider } from "react-redux";
import { createStore, type RootState } from "@/store";


interface RenderWithProvidersOptions extends Omit<RenderOptions, "wrapper"> {
    preloadedState?: Partial<RootState>;
    initialEntries?: string[];
}


/**
 * Test rendering function with custom memory router.
 *
 * Allows passing preloaded Redux state & router history.
 *
 * Returns a ``location`` ref that always tracks the current
 * router location, so tests can assert on URL changes after
 * redirects (e.g. ``expect(location.current?.pathname).toBe("/not-found")``).
 */
export const renderWithProviders = (
    ui: ReactElement,
    {
        preloadedState,
        initialEntries = ["/"],
        ...renderOptions
    }: RenderWithProvidersOptions = {},
) => {
    const store = createStore(preloadedState);
    const locationRef: { current: Location | null } = { current: null };

    function LocationCapture() {
        locationRef.current = useLocation();
        return null;
    }

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <Provider store={store}>
                <MemoryRouter initialEntries={initialEntries}>
                    <LocationCapture />
                    {children}
                </MemoryRouter>
            </Provider>
        );
    }

    return {
        store,
        location: locationRef,
        ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    };
};
