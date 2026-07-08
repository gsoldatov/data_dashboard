import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { datasetValidatorMap } from "@/types/visualization-data/visualization-data";
import { App } from "@/components/app";


const russiaGdpSchema =
    datasetValidatorMap["russia_gdp_constant_prices_rub"]!;


describe("Russia GDP data validation", () => {
    describe("schema", () => {
        it("rejects non-array data", () => {
            const result = russiaGdpSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("rejects array with non-object items", () => {
            const result = russiaGdpSchema.safeParse([123]);
            expect(result.success).toBe(false);
        });

        it("rejects items with wrong field types", () => {
            const result = russiaGdpSchema.safeParse(
                [{ year: "2021", value: 100 }],
            );
            expect(result.success).toBe(false);
        });

        it("rejects items with missing fields", () => {
            const result = russiaGdpSchema.safeParse(
                [{ year: 2021 }],
            );
            expect(result.success).toBe(false);
        });

        it("accepts empty array", () => {
            const result = russiaGdpSchema.safeParse([]);
            expect(result.success).toBe(true);
        });

        it("accepts valid data", () => {
            const result = russiaGdpSchema.safeParse([
                { year: 2021, value: 100.0 },
                { year: 2022, value: 102.1 },
            ]);
            expect(result.success).toBe(true);
        });
    });

    describe("valid data renders page", () => {
        let backend: MockBackend;

        beforeAll(async () => {
            await import(
                "@/components/pages/visualizations/mdx/russia_gdp.mdx"
            );
        });

        beforeEach(() => {
            backend = new MockBackend();
            backend.setup();
        });

        it("renders page with default mock data", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_gdp"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Russia GDP"),
                ).toBeInTheDocument();
            });
        });
    });
});
