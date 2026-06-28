import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { App } from "@/components/app";


describe("Russia GDP visualization", () => {
    let backend: MockBackend;

    beforeAll(async () => {
        await import("@/components/pages/visualizations/mdx/russia_gdp.mdx");
    });

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    describe("Charts", () => {
        it("renders three line charts with year labels", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_gdp"],
            });

            await waitFor(() => {
                expect(
                    screen.getByTestId("gdp-chart-group"),
                ).toBeInTheDocument();
            });

            const container = screen.getByTestId("gdp-chart-group");

            await waitFor(() => {
                const curves = container.querySelectorAll(".recharts-line-curve");
                expect(curves).toHaveLength(3);
            });

            // Year labels from mock data visible on X axes
            for (const year of [2021, 2022, 2023]) {
                expect(container.textContent).toContain(String(year));
            }
        });
    });
});
