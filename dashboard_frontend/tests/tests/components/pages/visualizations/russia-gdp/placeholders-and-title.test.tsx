import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { addNetworkErrorOverride } from "../../../../../mocks/backend/route-handlers/overrides";
import { App } from "@/components/app";


const DATA_URL = "/api/visualization-data/";


describe("Russia GDP visualization", () => {
    let backend: MockBackend;

    beforeAll(async () => {
        await import("@/components/pages/visualizations/mdx/russia_gdp.mdx");
    });

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    describe("Placeholders & title", () => {
        it("shows error when visualization data fetch fails", async () => {
            addNetworkErrorOverride(backend.dispatcher, DATA_URL, "GET");

            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_gdp"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to load the page."),
                ).toBeInTheDocument();
            });
        });

        it("renders page title and chart titles", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_gdp"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Russia GDP"),
                ).toBeInTheDocument();
            });

            expect(
                screen.getByRole("navigation", {
                    name: "Visualization pages",
                }),
            ).toBeInTheDocument();

            expect(
                screen.getByText("GDP, Constant Prices, Bln RUB"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("GDP, Constant Prices, Bln USD"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("GDP PPP, Constant Prices, Bln USD"),
            ).toBeInTheDocument();
        });
    });
});
