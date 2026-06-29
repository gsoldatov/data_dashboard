import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { visualizationDataResponseValidatorMap } from "@/types/visualization-data/visualization-data";
import { App } from "@/components/app";


const russiaInflationSchema =
    visualizationDataResponseValidatorMap["russia_inflation"]!;


describe("Russia Inflation data validation", () => {
    describe("schema", () => {
        it("rejects non-array data", () => {
            const result = russiaInflationSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("rejects wrong number of datasets", () => {
            const result = russiaInflationSchema.safeParse([
                [{ year_month: "2023-01", value: 100.8 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects CPI items with wrong field types", () => {
            const result = russiaInflationSchema.safeParse([
                [{ year_month: 202301, value: 100.8 }],
                [{ year_month: "2023-01", key_rate: 7.5 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects CPI items with missing fields", () => {
            const result = russiaInflationSchema.safeParse([
                [{ year_month: "2023-01" }],
                [{ year_month: "2023-01", key_rate: 7.5 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects key rate items with wrong years_month type", () => {
            const result = russiaInflationSchema.safeParse([
                [{ year_month: "2023-01", value: 100.8 }],
                [{ year_month: 202301, key_rate: 7.5 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("accepts key rate items with optional fields omitted", () => {
            const result = russiaInflationSchema.safeParse([
                [{ year_month: "2023-01", value: 100.8 }],
                [{ year_month: "2023-01" }],
            ]);
            expect(result.success).toBe(true);
        });

        it("accepts key rate items with all optional fields present", () => {
            const result = russiaInflationSchema.safeParse([
                [{ year_month: "2023-01", value: 100.8 }],
                [
                    {
                        year_month: "2023-01",
                        key_rate: 7.5,
                        inflation_yoy: 11.0,
                    },
                ],
            ]);
            expect(result.success).toBe(true);
        });

        it("accepts empty arrays in both tuple positions", () => {
            const result = russiaInflationSchema.safeParse([[], []]);
            expect(result.success).toBe(true);
        });
    });

    describe("valid data renders page", () => {
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

        it("renders page with default mock data", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_inflation"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Russia Inflation"),
                ).toBeInTheDocument();
            });
        });
    });
});
