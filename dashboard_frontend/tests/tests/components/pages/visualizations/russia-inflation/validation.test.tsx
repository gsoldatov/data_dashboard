import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { datasetValidatorMap } from "@/types/visualization-data/visualization-data";
import { App } from "@/components/app";


const cpiSchema =
    datasetValidatorMap["russia_consumer_price_index"]!;
const keyRateSchema =
    datasetValidatorMap["russia_key_rate"]!;


describe("Russia Inflation data validation", () => {
    describe("CPI schema", () => {
        it("rejects non-array data", () => {
            const result = cpiSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("rejects items with wrong field types", () => {
            const result = cpiSchema.safeParse(
                [{ year_month: 202301, value: 100.8 }],
            );
            expect(result.success).toBe(false);
        });

        it("rejects items with missing fields", () => {
            const result = cpiSchema.safeParse(
                [{ year_month: "2023-01" }],
            );
            expect(result.success).toBe(false);
        });

        it("accepts empty array", () => {
            const result = cpiSchema.safeParse([]);
            expect(result.success).toBe(true);
        });

        it("accepts valid data", () => {
            const result = cpiSchema.safeParse([
                { year_month: "2023-01", value: 100.8 },
            ]);
            expect(result.success).toBe(true);
        });
    });

    describe("Key Rate schema", () => {
        it("rejects non-array data", () => {
            const result = keyRateSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("rejects items with wrong year_month type", () => {
            const result = keyRateSchema.safeParse(
                [{ year_month: 202301, key_rate: 7.5 }],
            );
            expect(result.success).toBe(false);
        });

        it("accepts optional fields omitted", () => {
            const result = keyRateSchema.safeParse([
                { year_month: "2023-01" },
            ]);
            expect(result.success).toBe(true);
        });

        it("accepts all optional fields present", () => {
            const result = keyRateSchema.safeParse([
                { year_month: "2023-01", key_rate: 7.5, inflation_yoy: 11.0 },
            ]);
            expect(result.success).toBe(true);
        });

        it("accepts empty array", () => {
            const result = keyRateSchema.safeParse([]);
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
