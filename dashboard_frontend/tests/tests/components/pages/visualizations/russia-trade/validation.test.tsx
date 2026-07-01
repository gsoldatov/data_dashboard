import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { visualizationDataResponseValidatorMap } from "@/types/visualization-data/visualization-data";
import { App } from "@/components/app";


const russiaTradeSchema =
    visualizationDataResponseValidatorMap["russia_trade"]!;


describe("Russia Trade data validation", () => {
    describe("schema", () => {
        it("rejects non-array data", () => {
            const result = russiaTradeSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("rejects wrong number of datasets", () => {
            const result = russiaTradeSchema.safeParse([
                [{ year: 2023, country: "China", value: 100 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects by-country items with wrong field types", () => {
            const result = russiaTradeSchema.safeParse([
                [{ year: "2023", country: "China", value: 100 }],
                [{ year: 2023, value: 100 }],
                [{ year: 2023, product_category: "Fuels", value: 100 }],
                [{ year: 2023, country: "China", value: 100 }],
                [{ year: 2023, value: 100 }],
                [{ year: 2023, product_category: "Fuels", value: 100 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects by-country items with missing fields", () => {
            const result = russiaTradeSchema.safeParse([
                [{ year: 2023, country: "China" }],
                [{ year: 2023, value: 100 }],
                [{ year: 2023, product_category: "Fuels", value: 100 }],
                [{ year: 2023, country: "China", value: 100 }],
                [{ year: 2023, value: 100 }],
                [{ year: 2023, product_category: "Fuels", value: 100 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects yearly totals with wrong year type", () => {
            const result = russiaTradeSchema.safeParse([
                [{ year: 2023, country: "China", value: 100 }],
                [{ year: "2023", value: 100 }],
                [{ year: 2023, product_category: "Fuels", value: 100 }],
                [{ year: 2023, country: "China", value: 100 }],
                [{ year: 2023, value: 100 }],
                [{ year: 2023, product_category: "Fuels", value: 100 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects by-category items with wrong field name", () => {
            const result = russiaTradeSchema.safeParse([
                [{ year: 2023, country: "China", value: 100 }],
                [{ year: 2023, value: 100 }],
                [{ year: 2023, category: "Fuels", value: 100 }],
                [{ year: 2023, country: "China", value: 100 }],
                [{ year: 2023, value: 100 }],
                [{ year: 2023, product_category: "Fuels", value: 100 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("accepts empty arrays in all tuple positions", () => {
            const result = russiaTradeSchema.safeParse([
                [], [], [], [], [], [],
            ]);
            expect(result.success).toBe(true);
        });

        it("accepts valid data with all 6 datasets", () => {
            const result = russiaTradeSchema.safeParse([
                [{ year: 2023, country: "China", value: 114000000000 }],
                [{ year: 2023, value: 588300000000 }],
                [
                    {
                        year: 2023,
                        product_category: "Fuels",
                        value: 320000000000,
                    },
                ],
                [{ year: 2023, country: "China", value: 87000000000 }],
                [{ year: 2023, value: 280400000000 }],
                [
                    {
                        year: 2023,
                        product_category: "Machines and Electronics",
                        value: 95000000000,
                    },
                ],
            ]);
            expect(result.success).toBe(true);
        });
    });

    describe("valid data renders page", () => {
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

        it("renders page with default mock data", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_trade"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Russia Trade"),
                ).toBeInTheDocument();
            });
        });
    });
});
