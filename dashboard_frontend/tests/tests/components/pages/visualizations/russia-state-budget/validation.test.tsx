import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { visualizationDataResponseValidatorMap } from "@/types/visualization-data/visualization-data";
import { App } from "@/components/app";


const russiaStateBudgetSchema =
    visualizationDataResponseValidatorMap["russia_state_budget"]!;


describe("Russia State Budget data validation", () => {
    describe("schema", () => {
        it("rejects non-array data", () => {
            const result = russiaStateBudgetSchema.safeParse({});
            expect(result.success).toBe(false);
        });

        it("rejects items with wrong field types", () => {
            const result = russiaStateBudgetSchema.safeParse([
                [{ year: "2022", number: "1", name: "Income", value: 100 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects items with missing fields", () => {
            const result = russiaStateBudgetSchema.safeParse([
                [{ year: 2022, number: "1" }],
            ]);
            expect(result.success).toBe(false);
        });

        it("rejects items with wrong field names", () => {
            const result = russiaStateBudgetSchema.safeParse([
                [{ year: 2022, number: "1", name: "Income", amount: 100 }],
            ]);
            expect(result.success).toBe(false);
        });

        it("accepts empty inner arrays", () => {
            const result = russiaStateBudgetSchema.safeParse([[]]);
            expect(result.success).toBe(true);
        });

        it("accepts valid single dataset", () => {
            const result = russiaStateBudgetSchema.safeParse([
                [
                    { year: 2022, number: "1", name: "Income, total", value: 27824.4 },
                    { year: 2023, number: "1", name: "Income, total", value: 29124.0 },
                ],
            ]);
            expect(result.success).toBe(true);
        });
    });

    describe("valid data renders page", () => {
        let backend: MockBackend;

        beforeAll(async () => {
            await import(
                "@/components/pages/visualizations/mdx/russia_state_budget.mdx"
            );
        });

        beforeEach(() => {
            backend = new MockBackend();
            backend.setup();
        });

        it("renders page with default mock data", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_state_budget"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Russia State Budget"),
                ).toBeInTheDocument();
            });
        });
    });
});
