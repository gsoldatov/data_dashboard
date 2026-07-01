import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { addNetworkErrorOverride } from "../../../../../mocks/backend/route-handlers/overrides";
import { App } from "@/components/app";


const DATA_URL = "/api/visualization-data/russia_trade";


describe("Russia Trade visualization", () => {
    let backend: MockBackend;

    beforeAll(async () => {
        await import(
            "@/components/pages/visualizations/mdx/russia_trade.mdx"
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
                initialEntries: ["/visualizations/russia_trade"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to load the page."),
                ).toBeInTheDocument();
            });
        });

        it("renders page title and section headings", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_trade"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Russia Trade"),
                ).toBeInTheDocument();
            });

            expect(
                screen.getByText("Total Exports & Imports by Year"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Trade Analysis"),
            ).toBeInTheDocument();
        });

        it("renders chart containers", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_trade"],
            });

            await waitFor(() => {
                const containers = document.querySelectorAll(
                    ".recharts-responsive-container",
                );
                expect(containers.length).toBeGreaterThanOrEqual(5);
            });
        });

        it("renders a single shared year selector", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_trade"],
            });

            await waitFor(() => {
                expect(screen.getByText("Year")).toBeInTheDocument();
            });

            const comboboxes = screen.getAllByRole("combobox");
            expect(comboboxes).toHaveLength(1);
        });
    });
});
