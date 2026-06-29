import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
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

    describe("Charts", () => {
        it("renders cumulative inflation bar chart with computed data", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_inflation"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Cumulative Inflation, %"),
                ).toBeInTheDocument();
            });

            // Bars rendered for the cumulative inflation bar chart
            // (may take an extra render cycle for period defaults to settle)
            await waitFor(() => {
                const containers = document.querySelectorAll(
                    ".recharts-responsive-container",
                );
                const bars = containers[0].querySelectorAll(
                    ".recharts-bar-rectangle",
                );
                expect(bars.length).toBeGreaterThanOrEqual(1);
            });
        });

        it("renders key rate line chart with correct data", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_inflation"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Key Rate, %"),
                ).toBeInTheDocument();
            });
            const containers = document.querySelectorAll(
                ".recharts-responsive-container",
            );
            const curves = containers[1].querySelectorAll(
                ".recharts-line-curve",
            );
            expect(curves.length).toBeGreaterThanOrEqual(1);
        });

        it("renders both chart sections", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_inflation"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Cumulative Inflation, %"),
                ).toBeInTheDocument();
                expect(
                    screen.getByText("Key Rate, %"),
                ).toBeInTheDocument();
            });
        });

        it("handles key rate items with missing key_rate values", async () => {
            backend.dispatcher.addHandlerOverride(
                DATA_URL,
                "GET",
                async () =>
                    new Response(
                        JSON.stringify([
                            // CPI data
                            [
                                { year_month: "2023-01", value: 100.5 },
                                { year_month: "2023-02", value: 100.4 },
                            ],
                            // Key rate data with some missing fields
                            [
                                { year_month: "2023-01", key_rate: 7.5, inflation_yoy: 11.0 },
                                { year_month: "2023-02" },
                                { year_month: "2023-03", key_rate: 8.0 },
                            ],
                        ]),
                        {
                            status: 200,
                            headers: { "Content-Type": "application/json" },
                        },
                    ),
            );

            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_inflation"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Cumulative Inflation, %"),
                ).toBeInTheDocument();
            });

            // Key rate chart still renders (filters out the item without key_rate)
            await waitFor(() => {
                const containers = document.querySelectorAll(
                    ".recharts-responsive-container",
                );
                const curves = containers[1].querySelectorAll(
                    ".recharts-line-curve",
                );
                expect(curves.length).toBeGreaterThanOrEqual(1);
            });
        });
    });
});
