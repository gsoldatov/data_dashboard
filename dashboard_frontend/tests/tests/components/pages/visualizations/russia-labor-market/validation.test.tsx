import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { visualizationDataResponseValidatorMap } from "@/types/visualization-data/visualization-data";
import { App } from "@/components/app";


const russiaLaborMarketSchema =
    visualizationDataResponseValidatorMap["russia_labor_market"]!;


describe("Russia Labor Market data validation", () => {
    describe("schema", () => {
        it("rejects non-array data", () => {
            const result = russiaLaborMarketSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("rejects wrong number of datasets", () => {
            const result = russiaLaborMarketSchema.safeParse([
                [{ year: 2023, value: 100 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects items with wrong field types", () => {
            const result = russiaLaborMarketSchema.safeParse([
                [{ year: "2023", value: 100 }],
                [{ year: 2023, sector: "mining", value: 100 }],
                [{ year_month: "2024-01", workforce: 100, employed: 100, unemployed: 10, workforce_share_in_population: 50, employed_share_in_population: 50, unemployed_share_in_workforce: 10 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects items with missing fields", () => {
            const result = russiaLaborMarketSchema.safeParse([
                [{ year: 2023 }],
                [{ year: 2023, sector: "mining", value: 100 }],
                [{ year_month: "2024-01", workforce: 100, employed: 100, unemployed: 10, workforce_share_in_population: 50, employed_share_in_population: 50, unemployed_share_in_workforce: 10 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects items with wrong field names in workforce dataset", () => {
            const result = russiaLaborMarketSchema.safeParse([
                [{ year: 2023, value: 100 }],
                [{ year: 2023, sector: "mining", value: 100 }],
                [{ year_month: "2024-01", workforce: 100, employed: 100, unemployed: 10, wrong_field: 50, employed_share_in_population: 50, unemployed_share_in_workforce: 10 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("accepts empty arrays in all tuple positions", () => {
            const result = russiaLaborMarketSchema.safeParse([[], [], []]);
            expect(result.success).toBe(true);
        });

        it("accepts valid three-dataset tuple", () => {
            const result = russiaLaborMarketSchema.safeParse([
                [{ year: 2023, value: 74854.0 }],
                [{ year: 2023, sector: "mining", value: 89343.7 }],
                [{ year_month: "2024-01", workforce: 76500.0, employed: 73100.0, unemployed: 3400.0, workforce_share_in_population: 62.5, employed_share_in_population: 59.8, unemployed_share_in_workforce: 4.4 }],
            ]);
            expect(result.success).toBe(true);
        });
    });

    describe("valid data renders page", () => {
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

        it("renders page with default mock data", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_labor_market"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Russia Labor Market"),
                ).toBeInTheDocument();
            });
        });
    });
});
