import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { MockBackend } from "../../../mocks/backend/mock-backend";
import {
    addNetworkErrorOverride,
} from "../../../mocks/backend/route-handlers/overrides";
import { Feed } from "@/components/pages/feed";


const SETTINGS_URL = "/api/visualization-settings/";


describe("Feed", () => {
    let backend: MockBackend;

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    it("shows error message when the batch settings query fails", async () => {
        addNetworkErrorOverride(backend.dispatcher, SETTINGS_URL, "GET");

        renderWithProviders(<Feed />);

        await waitFor(() => {
            expect(
                screen.getByText("Failed to load the page."),
            ).toBeInTheDocument();
        });
    });

    it("shows info message when no visualizations are published", async () => {
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

        renderWithProviders(<Feed />);

        await waitFor(() => {
            expect(
                screen.getByText("No visualizations are available."),
            ).toBeInTheDocument();
        });
    });

    it("renders published visualization links", async () => {
        renderWithProviders(<Feed />);

        await waitFor(() => {
            expect(
                screen.getByText("Dashboard Visualizations"),
            ).toBeInTheDocument();
        });

        await waitFor(() => {
            expect(
                screen.getByText("Russia State Budget"),
            ).toBeInTheDocument();
        });
    });
});
