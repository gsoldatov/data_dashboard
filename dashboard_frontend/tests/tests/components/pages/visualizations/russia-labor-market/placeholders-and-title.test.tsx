import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { addNetworkErrorOverride } from "../../../../../mocks/backend/route-handlers/overrides";
import { App } from "@/components/app";


const DATA_URL = "/api/visualization-data/";


describe("Russia Labor Market visualization", () => {
    let backend: MockBackend;

    beforeAll(async () => {
        await import(
            "@/components/pages/visualizations/mdx/russia_labor_market.mdx"
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
                initialEntries: ["/visualizations/russia_labor_market"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to load the page."),
                ).toBeInTheDocument();
            });
        });

        it("renders page title and section headings", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_labor_market"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Russia Labor Market"),
                ).toBeInTheDocument();
            });

            expect(
                screen.getByRole("navigation", {
                    name: "Visualization pages",
                }),
            ).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByText("Average Salaries")).toBeInTheDocument();
                expect(
                    screen.getByText("Salaries By Sector"),
                ).toBeInTheDocument();
                expect(screen.getByText("Workforce")).toBeInTheDocument();
            });
        });

        it("renders chart containers", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_labor_market"],
            });

            await waitFor(() => {
                const containers = document.querySelectorAll(
                    ".recharts-responsive-container",
                );
                // Average Salary (bar), Sector (line), Workforce (bar),
                // Engagement (line), Unemployment (line)
                expect(containers.length).toBeGreaterThanOrEqual(5);
            });
        });

        it("renders workforce chart group container", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_labor_market"],
            });

            await waitFor(() => {
                expect(
                    screen.getByTestId("workforce-chart-group"),
                ).toBeInTheDocument();
            });
        });
    });
});
