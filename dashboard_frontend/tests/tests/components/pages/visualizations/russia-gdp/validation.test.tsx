import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { visualizationDataResponseValidatorMap } from "@/types/visualization-data/visualization-data";
import { App } from "@/components/app";


const russiaGdpSchema =
    visualizationDataResponseValidatorMap["russia_gdp"]!;


describe("Russia GDP data validation", () => {
    describe("schema", () => {
        it("rejects non-array data", () => {
            const result = russiaGdpSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("rejects array of non-arrays", () => {
            const result = russiaGdpSchema.safeParse([{ year: 2021, value: 100 }]);
            expect(result.success).toBe(false);
        });

        it("rejects items with wrong field types", () => {
            const result = russiaGdpSchema.safeParse([
                [{ year: "2021", value: 100 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects items with missing fields", () => {
            const result = russiaGdpSchema.safeParse([
                [{ year: 2021 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("accepts empty inner arrays", () => {
            const result = russiaGdpSchema.safeParse([[]]);
            expect(result.success).toBe(true);
        });

        it("accepts valid single dataset", () => {
            const result = russiaGdpSchema.safeParse([
                [{ year: 2021, value: 100.0 }],
            ]);
            expect(result.success).toBe(true);
        });

        it("accepts valid multiple datasets", () => {
            const result = russiaGdpSchema.safeParse([
                [{ year: 2021, value: 100.0 }],
                [{ year: 2022, value: 102.1 }],
                [{ year: 2023, value: 105.3 }],
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
