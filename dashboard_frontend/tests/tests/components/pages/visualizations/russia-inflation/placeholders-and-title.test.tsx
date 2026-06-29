import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { addNetworkErrorOverride } from "../../../../../mocks/backend/route-handlers/overrides";
import { App } from "@/components/app";


const DATA_URL = "/api/visualization-data/russia_inflation";


describe("Russia Inflation visualization", () => {
    let backend: MockBackend;

    beforeAll(async () => {
        await import(
            "@/components/pages/visualizations/mdx/russia_inflation.mdx"
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
                initialEntries: ["/visualizations/russia_inflation"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to load the page."),
                ).toBeInTheDocument();
            });
        });

        it("renders page title and section headings", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_inflation"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Russia Inflation"),
                ).toBeInTheDocument();
            });

            expect(screen.getByText("Cumulative Inflation, %")).toBeInTheDocument();
            expect(screen.getByText("Key Rate, %")).toBeInTheDocument();
        });

        it("renders chart containers", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_inflation"],
            });

            await waitFor(() => {
                const containers = document.querySelectorAll(
                    ".recharts-responsive-container",
                );
                // Cumulative inflation bar chart + key rate line chart
                expect(containers.length).toBeGreaterThanOrEqual(2);
            });
        });

        it("renders period selectors", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_inflation"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Start period"),
                ).toBeInTheDocument();
                expect(
                    screen.getByText("End period"),
                ).toBeInTheDocument();
            });
        });
    });
});
