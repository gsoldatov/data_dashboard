import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { addNetworkErrorOverride } from "../../../../../mocks/backend/route-handlers/overrides";
import { App } from "@/components/app";


const DATA_URL = "/api/visualization-data/";


describe("Russia Economy visualization", () => {
    let backend: MockBackend;

    beforeAll(async () => {
        await import(
            "@/components/pages/visualizations/mdx/russia_economy.mdx"
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
                initialEntries: ["/visualizations/russia_economy"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to load the page."),
                ).toBeInTheDocument();
            });
        });

        it("renders page title and section headings", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_economy"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Russia Economy Dashboard"),
                ).toBeInTheDocument();
            });

            expect(screen.getByText("GDP")).toBeInTheDocument();
            expect(
                screen.getByText("Inflation & Unemployment"),
            ).toBeInTheDocument();
            expect(screen.getByText("Trade")).toBeInTheDocument();
            expect(screen.getByText("Budget")).toBeInTheDocument();
        });

        it("renders a single year selector", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_economy"],
            });

            await waitFor(() => {
                expect(screen.getByText("Year")).toBeInTheDocument();
            });

            const comboboxes = screen.getAllByRole("combobox");
            expect(comboboxes).toHaveLength(1);
        });

        it("renders all indicator tables", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_economy"],
            });

            await waitFor(() => {
                expect(
                    screen.getByTestId("gdp-table"),
                ).toBeInTheDocument();
            });

            expect(
                screen.getByTestId("inflation-table"),
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("trade-table"),
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("budget-table"),
            ).toBeInTheDocument();
        });
    });
});
