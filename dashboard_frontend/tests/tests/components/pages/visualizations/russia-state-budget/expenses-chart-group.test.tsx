import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { App } from "@/components/app";


describe("Russia State Budget visualization", () => {
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

    /** Wait for the expenses chart group testid and return a scoped within. */
    const expensesScope = async () => {
        await waitFor(() => {
            expect(screen.getByTestId("expenses-chart-group")).toBeInTheDocument();
        });
        return within(screen.getByTestId("expenses-chart-group"));
    };

    /** Open a dropdown, click a checkbox item, then press Escape to close. */
    const selectInDropdown = async (
        user: ReturnType<typeof userEvent.setup>,
        trigger: () => HTMLElement | Promise<HTMLElement>,
        checkboxLabel: string | RegExp,
    ) => {
        await user.click(await trigger());
        await user.click(screen.getByRole("menuitemcheckbox", { name: checkboxLabel }));
        await user.keyboard("{Escape}");
        await waitFor(() => {
            expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        });
    };

    /** Returns a trigger lambda for the '2.x' breadcrumb button. */
    const trigger2x = async (): Promise<HTMLElement> => {
        const scope = within(screen.getByTestId("expenses-chart-group"));
        await waitFor(() => {
            expect(
                scope.getByRole("button", { name: "2.x" }),
            ).toBeInTheDocument();
        });
        return scope.getByRole("button", { name: "2.x" });
    };

    // ── Section heading ──────────────────────────────────────────────────

    describe("Expenses", () => {
        it("renders the Expenses section heading", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_state_budget"],
            });

            await waitFor(() => {
                expect(screen.getByRole("heading", { name: "Expenses" })).toBeInTheDocument();
            });

            const scope = await expensesScope();
            expect(scope.getByText("Select years")).toBeInTheDocument();
        });

        describe("year selection", () => {
            it("shows all available years in the dropdown", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await expensesScope();

                await user.click(scope.getByText("Select years"));

                expect(
                    screen.getByRole("menuitemcheckbox", { name: "2022" }),
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("menuitemcheckbox", { name: "2023" }),
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("menuitemcheckbox", { name: "2024" }),
                ).toBeInTheDocument();
            });
        });

        describe("category selection", () => {
            it("renders the '2.x' breadcrumb segment", async () => {
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await expensesScope();
                await waitFor(() => {
                    expect(
                        scope.getByRole("button", { name: "2.x" }),
                    ).toBeInTheDocument();
                });
            });

            it("does not show '2.x.x' when no categories selected", async () => {
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await expensesScope();
                expect(
                    scope.queryByRole("button", { name: "2.x.x" }),
                ).not.toBeInTheDocument();
            });

            it("'2.x' dropdown shows all top-level expenses categories", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await expensesScope();

                await user.click(scope.getByRole("button", { name: "2.x" }));

                await waitFor(() => {
                    expect(
                        screen.getByRole("menuitemcheckbox", {
                            name: /2\.1 Social Policy/,
                        }),
                    ).toBeInTheDocument();
                });
                expect(
                    screen.getByRole("menuitemcheckbox", {
                        name: /2\.2 National Defense/,
                    }),
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("menuitemcheckbox", {
                        name: /2\.3 National Economy/,
                    }),
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("menuitemcheckbox", { name: /2\.4 Healthcare/ }),
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("menuitemcheckbox", {
                        name: /2\.5 Other Expenses/,
                    }),
                ).toBeInTheDocument();
            });
        });

        describe("category badges", () => {
            it("selecting a top-level category shows it as a badge", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await expensesScope();

                await selectInDropdown(user, trigger2x, /2\.1 Social Policy/);

                expect(scope.getByText(/2\.1 Social Policy/)).toBeInTheDocument();
            });

            it("selecting a parent shows '2.x.x' with its children", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await expensesScope();

                await selectInDropdown(user, trigger2x, /2\.1 Social Policy/);

                await user.click(scope.getByRole("button", { name: "2.x.x" }));

                await waitFor(() => {
                    expect(
                        screen.getByRole("menuitemcheckbox", {
                            name: /2\.1\.1 Pensions/,
                        }),
                    ).toBeInTheDocument();
                });
                expect(
                    screen.getByRole("menuitemcheckbox", {
                        name: /2\.1\.2 Social Benefits/,
                    }),
                ).toBeInTheDocument();
            });
        });

        describe("charts", () => {
            it("renders all four chart titles and treemap/diff placeholders", async () => {
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await expensesScope();

                await waitFor(() => {
                    expect(
                        scope.getByText("Expenses Categories"),
                    ).toBeInTheDocument();
                });
                expect(
                    scope.getByText("Expenses Category Shares"),
                ).toBeInTheDocument();
                expect(
                    scope.getByText("Expenses Category Treemap"),
                ).toBeInTheDocument();
                expect(
                    scope.getByText("Expenses Category Changes"),
                ).toBeInTheDocument();
            });

            it("shows placeholders when there are no expenses categories", async () => {
                backend.dispatcher.addHandlerOverride(
                    "/api/visualization-data/",
                    "GET",
                    async () =>
                        new Response(
                            JSON.stringify({
                                russia_state_budget: [
                                    { year: 2022, number: "1", name: "Income, total", value: 27824.4 },
                                ],
                            }),
                            {
                                status: 200,
                                headers: { "Content-Type": "application/json" },
                            },
                        ),
                );

                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await expensesScope();

                await waitFor(() => {
                    expect(scope.getAllByText("No data available").length).toBe(2);
                });
            });

            it("renders without crashing when no expenses items in data", async () => {
                backend.dispatcher.addHandlerOverride(
                    "/api/visualization-data/",
                    "GET",
                    async () =>
                        new Response(
                            JSON.stringify({
                                russia_state_budget: [
                                    { year: 2022, number: "3", name: "Balance", value: 0 },
                                ],
                            }),
                            {
                                status: 200,
                                headers: { "Content-Type": "application/json" },
                            },
                        ),
                );

                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await expensesScope();
                expect(scope.getByText("Select years")).toBeInTheDocument();
            });
        });
    });
});
