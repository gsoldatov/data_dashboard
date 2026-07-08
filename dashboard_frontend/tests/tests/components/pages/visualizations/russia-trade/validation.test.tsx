import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { datasetValidatorMap } from "@/types/visualization-data/visualization-data";
import { App } from "@/components/app";


const exportsByCountrySchema =
    datasetValidatorMap["russia_trade_exports_by_country"]!;
const exportsYearlySchema =
    datasetValidatorMap["russia_trade_exports_yearly_totals"]!;
const exportsByCategorySchema =
    datasetValidatorMap["russia_trade_exports_by_category"]!;


describe("Russia Trade data validation", () => {
    describe("By-country schema", () => {
        it("rejects non-array data", () => {
            const result = exportsByCountrySchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("rejects items with wrong field types", () => {
            const result = exportsByCountrySchema.safeParse(
                [{ year: "2023", country: "China", value: 100 }],
            );
            expect(result.success).toBe(false);
        });

        it("rejects items with missing fields", () => {
            const result = exportsByCountrySchema.safeParse(
                [{ year: 2023, country: "China" }],
            );
            expect(result.success).toBe(false);
        });

        it("accepts empty array", () => {
            const result = exportsByCountrySchema.safeParse([]);
            expect(result.success).toBe(true);
        });

        it("accepts valid data", () => {
            const result = exportsByCountrySchema.safeParse([
                { year: 2023, country: "China", value: 114000000000 },
            ]);
            expect(result.success).toBe(true);
        });
    });

    describe("Yearly totals schema", () => {
        it("rejects non-array data", () => {
            const result = exportsYearlySchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("rejects items with wrong field types", () => {
            const result = exportsYearlySchema.safeParse(
                [{ year: "2023", value: 100 }],
            );
            expect(result.success).toBe(false);
        });

        it("accepts valid data", () => {
            const result = exportsYearlySchema.safeParse([
                { year: 2023, value: 588300000000 },
            ]);
            expect(result.success).toBe(true);
        });
    });

    describe("By-category schema", () => {
        it("rejects items with wrong field name", () => {
            const result = exportsByCategorySchema.safeParse(
                [{ year: 2023, category: "Fuels", value: 100 }],
            );
            expect(result.success).toBe(false);
        });

        it("accepts valid data", () => {
            const result = exportsByCategorySchema.safeParse([
                { year: 2023, product_category: "Fuels", value: 320000000000 },
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
