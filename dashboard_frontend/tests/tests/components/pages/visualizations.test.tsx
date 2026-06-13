import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { MockBackend } from "../../../mocks/backend/mock-backend";
import { addNetworkErrorOverride } from "../../../mocks/backend/route-handlers/overrides";
import { preloadedAdminState } from "../../../mocks/mock-data/store";
import { App } from "@/components/app";


const SETTINGS_URL = "/api/visualization-settings/";


describe("Visualization", () => {
    let backend: MockBackend;

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    it("shows error when the published status check fails", async () => {
        addNetworkErrorOverride(backend.dispatcher, SETTINGS_URL, "GET");

        renderWithProviders(<App />, {
            initialEntries: ["/visualizations/russia_state_budget"],
        });

        await waitFor(() => {
            expect(
                screen.getByText("Failed to load the page."),
            ).toBeInTheDocument();
        });
    });

    it("shows not-found page when slug is missing", async () => {
        // `/visualizations/` does not match `:slug` so React Router
        // falls through to the catch-all route; no redirect is dispatched.
        renderWithProviders(<App />, {
            initialEntries: ["/visualizations/"],
        });

        await waitFor(() => {
            expect(
                screen.getByText("Page not found."),
            ).toBeInTheDocument();
        });
    });

    it("redirects to not-found when slug does not match any MDX", async () => {
        const { location } = renderWithProviders(<App />, {
            initialEntries: ["/visualizations/nonexistent"],
        });

        await waitFor(() => {
            expect(
                screen.getByText("Page not found."),
            ).toBeInTheDocument();
        });
        expect(location.current?.pathname).toBe("/not-found");
    });

    it("redirects to not-found when visualization is not published", async () => {
        backend.dispatcher.addHandlerOverride(
            SETTINGS_URL,
            "GET",
            async () =>
                new Response(
                    JSON.stringify({
                        russia_state_budget: { is_published: false },
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    },
                ),
        );

        const { location } = renderWithProviders(<App />, {
            initialEntries: ["/visualizations/russia_state_budget"],
        });

        await waitFor(() => {
            expect(
                screen.getByText("Page not found."),
            ).toBeInTheDocument();
        });
        expect(location.current?.pathname).toBe("/not-found");
    });

    it("admins can view unpublished visualizations", async () => {
        backend.dispatcher.addHandlerOverride(
            "/api/auth/me",
            "GET",
            async () =>
                new Response(
                    JSON.stringify({
                        id: 1,
                        username: "admin",
                        role: "admin",
                        created_at: "2025-01-01T00:00:00Z",
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    },
                ),
        );
        backend.dispatcher.addHandlerOverride(
            SETTINGS_URL,
            "GET",
            async () =>
                new Response(
                    JSON.stringify({
                        russia_state_budget: { is_published: false },
                    }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/json" },
                    },
                ),
        );

        const { location } = renderWithProviders(<App />, {
            initialEntries: ["/visualizations/russia_state_budget"],
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(
                screen.queryByText("Page not found."),
            ).toBeNull();
        });
        expect(location.current?.pathname).not.toBe("/not-found");
    });
});
