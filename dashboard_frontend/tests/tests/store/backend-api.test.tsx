import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { App } from "@/components/app";
import { renderWithProviders } from "../../test-utils";
import { MockBackend } from "../../mocks/backend/mock-backend";
import {
    preloadedAdminState,
    preloadedNullUserState,
} from "../../mocks/mock-data/store";

describe("baseQuery session expiry", () => {
    let backend: MockBackend;

    beforeEach(() => {
        backend = new MockBackend();
        backend.dispatcher.xIsAuthenticated = false;
        backend.setup();
    });

    it("redirects to login when x-is-authenticated is false and getCurrentUser has cached data", async () => {
        const { store } = renderWithProviders(<App />, {
            initialEntries: ["/visualizations/test"],
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
        });

        expect(store.getState().ui.redirectOnRender).toBe("");
    });

    it("does not redirect when x-is-authenticated is true", async () => {
        backend.dispatcher.xIsAuthenticated = true;

        renderWithProviders(<App />, {
            initialEntries: ["/visualizations/test"],
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(screen.getByText("Page not found.")).toBeInTheDocument();
        });
    });

    it("does not redirect when no cached user data exists", async () => {
        renderWithProviders(<App />, {
            initialEntries: ["/visualizations/test"],
        });

        await waitFor(() => {
            expect(screen.getByText("Page not found.")).toBeInTheDocument();
        });
    });

    it("does not redirect when cached user data is null", async () => {
        renderWithProviders(<App />, {
            initialEntries: ["/visualizations/test"],
            preloadedState: preloadedNullUserState(),
        });

        await waitFor(() => {
            expect(screen.getByText("Page not found.")).toBeInTheDocument();
        });
    });

    it("does not redirect for POST /api/auth/login", async () => {
        renderWithProviders(<App />, {
            initialEntries: ["/login"],
            preloadedState: preloadedNullUserState(),
        });

        const usernameInput = screen.getByLabelText("Username");
        const passwordInput = screen.getByLabelText("Password");
        const submitButton = screen.getByRole("button", { name: "Login" });

        await fireEvent.change(usernameInput, { target: { value: "admin" } });
        await fireEvent.change(passwordInput, { target: { value: "admin" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByText("Dashboard Visualizations"),
            ).toBeInTheDocument();
        });
    });
});
