import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "../../../test-utils";
import { redirectState } from "../../../mocks/mock-data/store";
import { LocationManageWrapper } from "@/components/stateful/location-manager-wrapper";

function TestRoutes() {
    return (
        <LocationManageWrapper>
            <Routes>
                <Route index element={<div>Home page</div>} />
                <Route path="login" element={<div>Login page</div>} />
            </Routes>
        </LocationManageWrapper>
    );
}

describe("LocationManageWrapper", () => {
    it("renders children when no redirect is set", () => {
        renderWithProviders(<TestRoutes />);
        expect(screen.getByText("Home page")).toBeInTheDocument();
    });

    it("redirects when redirectOnRender is set", async () => {
        const { store } = renderWithProviders(<TestRoutes />, {
            preloadedState: redirectState,
        });
        await waitFor(() => {
            expect(screen.getByText("Login page")).toBeInTheDocument();
        });
        expect(store.getState().ui.redirectOnRender).toBe("");
    });
});
