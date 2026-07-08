import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { addNetworkErrorOverride } from "../../../../../mocks/backend/route-handlers/overrides";
import { App } from "@/components/app";


const DATA_URL = "/api/visualization-data/";


describe("Russia State Budget visualization", () => {
    let backend: MockBackend;

    // The first render of <App> at this slug triggers a lazy MDX import
    // (via import.meta.glob + React.lazy).  The Vite transform pipeline
    // resolves the MDX module asynchronously; in a cold worker the import
    // may still be pending when the first waitFor expires.  Pre-loading the
    // module in beforeAll guarantees it is cached before any test renders.
    beforeAll(async () => {
        await import(
            "@/components/pages/visualizations/mdx/russia_state_budget.mdx"
        );
    });

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    describe("Placeholders & title", () => {
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

        it("renders page title and description", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_state_budget"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Russia State Budget"),
                ).toBeInTheDocument();
            });

            expect(
                screen.getByRole("navigation", {
                    name: "Visualization pages",
                }),
            ).toBeInTheDocument();

            expect(
                screen.getByText(
                    "Budget plan & execution data for Russian Federation.",
                ),
            ).toBeInTheDocument();
        });
    });
});
