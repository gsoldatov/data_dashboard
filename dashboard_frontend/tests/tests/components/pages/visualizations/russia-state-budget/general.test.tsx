import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { App } from "@/components/app";


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

    /** Wait for the general chart group testid and return a scoped within. */
    const generalScope = async () => {
        await waitFor(() => {
            expect(screen.getByTestId("general-chart-group")).toBeInTheDocument();
        });
        return within(screen.getByTestId("general-chart-group"));
    };

    describe("General", () => {
        it("renders the income & expenses line chart with correct data", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_state_budget"],
            });

            const scope = await generalScope();

            expect(scope.getByText("Expenses")).toBeInTheDocument();
            // Legend renders one "Income" entry inside the chart group
            expect(scope.getAllByText("Income")).toHaveLength(1);

            // Year labels from mock data visible on X axis
            for (const year of [2022, 2023, 2024]) {
                expect(
                    scope.getAllByText(String(year)),
                ).toHaveLength(2);
            }

            // Two line paths rendered (income + expenses)
            const container = screen.getByTestId("general-chart-group");
            const curves = container.querySelectorAll(
                ".recharts-line-curve",
            );
            expect(curves).toHaveLength(2);
        });

        it("renders the budget balance bar chart with correct data", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_state_budget"],
            });

            const scope = await generalScope();

            expect(
                scope.getByText("Profit (+) / Deficit (-)"),
            ).toBeInTheDocument();

            // Bars rendered (3 years × 1 series)
            const container = screen.getByTestId("general-chart-group");
            const bars = container.querySelectorAll(".recharts-bar-rectangle");
            expect(bars).toHaveLength(3);
        });
    });
});
