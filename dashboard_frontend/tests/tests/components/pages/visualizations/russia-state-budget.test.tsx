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
                screen.getByText(
                    "Budget plan & execution data for Russian Federation.",
                ),
            ).toBeInTheDocument();
        });
    });

    describe("General", () => {
        it("renders the income & expenses line chart with correct data", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_state_budget"],
            });

            await waitFor(() => {
                expect(screen.getByText("Expenses")).toBeInTheDocument();
            });
            // "Income" appears in chart legend, section heading, and breadcrumb
            expect(screen.getAllByText("Income").length).toBeGreaterThanOrEqual(1);

            // Year labels from mock data visible on X axis
            for (const year of [2022, 2023, 2024]) {
                expect(
                    screen.getAllByText(String(year)),
                ).toHaveLength(2);
            }

            // Two line paths rendered (income + expenses)
            const curves = document.querySelectorAll(
                ".recharts-line-curve",
            );
            expect(curves).toHaveLength(2);
        });

        it("renders the budget balance bar chart with correct data", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_state_budget"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Profit (+) / Deficit (-)"),
                ).toBeInTheDocument();
            });

            // Bars rendered (3 years × 1 series)
            const bars = document.querySelectorAll(".recharts-bar-rectangle");
            expect(bars).toHaveLength(3);
        });
    });

    describe("Income", () => {
        it("renders the Income section heading", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_state_budget"],
            });

            await waitFor(() => {
                expect(screen.getByRole("heading", { name: "Income" })).toBeInTheDocument();
            });

            // The year dropdown trigger should be visible
            expect(screen.getByText("Years")).toBeInTheDocument();
        });
    });
});
