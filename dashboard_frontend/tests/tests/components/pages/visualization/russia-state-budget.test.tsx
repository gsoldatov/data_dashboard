import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils";
import { MockBackend } from "../../../../mocks/backend/mock-backend";
import { addNetworkErrorOverride } from "../../../../mocks/backend/route-handlers/overrides";
import { App } from "@/components/app";


const DATA_URL = "/api/visualization-data/russia_state_budget";


describe("Russia State Budget visualization", () => {
    let backend: MockBackend;

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    it("shows error when visualization data fetch fails", async () => {
        addNetworkErrorOverride(backend.dispatcher, DATA_URL, "GET");

        renderWithProviders(<App />, {
            initialEntries: ["/visualizations/russia_state_budget"],
        });

        await waitFor(() => {
            expect(
                screen.getByText("Failed to load the page."),
            ).toBeInTheDocument();
        });
    });

    it("renders the MDX content with visualization data", async () => {
        renderWithProviders(<App />, {
            initialEntries: ["/visualizations/russia_state_budget"],
        });

        await waitFor(() => {
            expect(
                screen.getByText("Russia State Budget"),
            ).toBeInTheDocument();
        });

        expect(
            screen.getByText(
                "Budget execution data for the Russian Federation.",
            ),
        ).toBeInTheDocument();
    });
});
