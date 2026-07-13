import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { App } from "@/components/app";


describe("Russia Trade charts", () => {
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

    it("renders the combined exports/imports line chart", async () => {
        renderWithProviders(<App />, {
            initialEntries: ["/visualizations/russia_trade"],
        });

        await waitFor(() => {
            expect(
                screen.getByText("Russia Trade"),
            ).toBeInTheDocument();
        });

        const lineCurves = document.querySelectorAll(
            ".recharts-line-curve",
        );
        expect(lineCurves.length).toBe(2);
    });

    describe("Trade chart group", () => {
        it("renders the year selector with last year selected", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_trade"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Trade Analysis"),
                ).toBeInTheDocument();
            });

            const yearLabel = screen.getByText("Year");
            const trigger = within(
                yearLabel.parentElement!,
            ).getByRole("combobox");
            expect(trigger).toHaveTextContent("2024");
        });

        it("renders both exports and imports bar charts", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_trade"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Exports by Country"),
                ).toBeInTheDocument();
                expect(
                    screen.getByText("Imports by Country"),
                ).toBeInTheDocument();
            });
        });

        it("renders both exports and imports treemaps", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_trade"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Exports by Category"),
                ).toBeInTheDocument();
                expect(
                    screen.getByText("Imports by Category"),
                ).toBeInTheDocument();
            });
        });

        it("renders exports treemap with category labels", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_trade"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Exports by Category"),
                ).toBeInTheDocument();
            });

            const header = screen.getByText("Exports by Category");
            const container = header.nextElementSibling as HTMLElement;
            const rects = within(container).getAllByText("Fuels");
            expect(rects.length).toBeGreaterThanOrEqual(1);
        });

        it("renders imports treemap with category labels", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_trade"],
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Imports by Category"),
                ).toBeInTheDocument();
            });

            const header = screen.getByText("Imports by Category");
            const container = header.nextElementSibling as HTMLElement;
            const rects = within(container).getAllByText(
                "Machines and Electronics",
            );
            expect(rects.length).toBeGreaterThanOrEqual(1);
        });
    });
});
