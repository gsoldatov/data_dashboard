import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../../test-utils";
import { MockBackend } from "../../../../../mocks/backend/mock-backend";
import { App } from "@/components/app";


describe("Russia State Budget visualization", () => {
    let backend: MockBackend;

    // The first render of <App> at this slug triggers a lazy MDX import
    // (via import.meta.glob + React.lazy).  The Vite transform pipeline
    // resolves the MDX module asynchronously; in a cold worker the import
    // may still be pending when the first waitFor expires.  Pre-loading the
    // module in beforeAll guarantees it is cached before any test renders.
    beforeAll(async () => {
        await import(
            "@/components/pages/visualizations/mdx/russia_state_budget.mdx"
        );
    });

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    /** Wait for the income chart group testid and return a scoped within. */
    const incomeScope = async () => {
        await waitFor(() => {
            expect(screen.getByTestId("income-chart-group")).toBeInTheDocument();
        });
        return within(screen.getByTestId("income-chart-group"));
    };

    /** Open a dropdown, click a checkbox item, then press Escape to close.
     *  `trigger` must return the dropdown-opening element (scoped or screen). */
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

    /** Returns a trigger lambda for the '1.x' breadcrumb button. */
    const trigger1x = async (): Promise<HTMLElement> => {
        const scope = within(screen.getByTestId("income-chart-group"));
        await waitFor(() => {
            expect(
                scope.getByRole("button", { name: "1.x" }),
            ).toBeInTheDocument();
        });
        return scope.getByRole("button", { name: "1.x" });
    };

    /** Returns a trigger lambda for the '1.x.x' breadcrumb button. */
    const trigger1xx = async (): Promise<HTMLElement> => {
        const scope = within(screen.getByTestId("income-chart-group"));
        await waitFor(() => {
            expect(
                scope.getByRole("button", { name: "1.x.x" }),
            ).toBeInTheDocument();
        });
        return scope.getByRole("button", { name: "1.x.x" });
    };

    // ── Section heading ──────────────────────────────────────────────────

    describe("Income", () => {
        it("renders the Income section heading", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/visualizations/russia_state_budget"],
            });

            await waitFor(() => {
                expect(screen.getByRole("heading", { name: "Income" })).toBeInTheDocument();
            });

            const scope = await incomeScope();
            expect(scope.getByText("Select years")).toBeInTheDocument();
        });

        describe("year selection", () => {
            it("renders the year dropdown trigger", async () => {
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();
                expect(scope.getByText("Select years")).toBeInTheDocument();
            });

            it("shows all available years in the dropdown", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

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

            it("initially treats all years as selected (no badges shown)", async () => {
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                expect(
                    scope.queryByRole("button", { name: "Clear all years" }),
                ).not.toBeInTheDocument();
            });

            it("selecting a year shows badge row with only that year", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                const trigger = () => scope.getByText("Select years");
                await selectInDropdown(user, trigger, "2024");

                const badges = within(scope.getByTestId("year-badges"));
                expect(badges.getByText("2024")).toBeInTheDocument();
                expect(badges.queryByText("2022")).not.toBeInTheDocument();
                expect(badges.queryByText("2023")).not.toBeInTheDocument();
            });

            it("selecting multiple years shows all selected as badges", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                const trigger = () => scope.getByText("Select years");
                await selectInDropdown(user, trigger, "2024");
                await selectInDropdown(user, trigger, "2022");

                const badges = within(scope.getByTestId("year-badges"));
                expect(badges.getByText("2022")).toBeInTheDocument();
                expect(badges.getByText("2024")).toBeInTheDocument();
                expect(badges.queryByText("2023")).not.toBeInTheDocument();
            });

            it("clicking a year badge removes that year from selection", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                const trigger = () => scope.getByText("Select years");
                await selectInDropdown(user, trigger, "2024");
                await selectInDropdown(user, trigger, "2022");

                const badges = within(scope.getByTestId("year-badges"));
                expect(badges.getByText("2022")).toBeInTheDocument();

                await user.click(badges.getByText("2022"));

                await waitFor(() => {
                    expect(badges.queryByText("2022")).not.toBeInTheDocument();
                });
                expect(badges.getByText("2024")).toBeInTheDocument();
            });

            it("removing the last selected year goes back to all", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                const trigger = () => scope.getByText("Select years");
                await selectInDropdown(user, trigger, "2023");

                const badges = within(scope.getByTestId("year-badges"));
                expect(badges.getByText("2023")).toBeInTheDocument();

                await user.click(badges.getByText("2023"));

                await waitFor(() => {
                    expect(badges.queryByText("2023")).not.toBeInTheDocument();
                });
                expect(
                    scope.queryByRole("button", { name: "Clear all years" }),
                ).not.toBeInTheDocument();
            });

            it("clear all years button removes all year badges", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                const trigger = () => scope.getByText("Select years");
                await selectInDropdown(user, trigger, "2022");
                await selectInDropdown(user, trigger, "2024");

                const badges = within(scope.getByTestId("year-badges"));
                expect(badges.getByText("2022")).toBeInTheDocument();
                expect(badges.getByText("2024")).toBeInTheDocument();

                await user.click(
                    scope.getByRole("button", { name: "Clear all years" }),
                );

                await waitFor(() => {
                    expect(
                        scope.queryByTestId("year-badges"),
                    ).not.toBeInTheDocument();
                });
            });
        });

        describe("category selection", () => {
            it("renders the 'Select categories' label", async () => {
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();
                expect(scope.getByText("Select categories")).toBeInTheDocument();
            });

            it("renders the '1.x' breadcrumb segment", async () => {
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();
                await waitFor(() => {
                    expect(
                        scope.getByRole("button", { name: "1.x" }),
                    ).toBeInTheDocument();
                });
            });

            it("does not show '1.x.x' when no categories selected", async () => {
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();
                expect(
                    scope.queryByRole("button", { name: "1.x.x" }),
                ).not.toBeInTheDocument();
            });

            it("checkboxes are unchecked when no categories selected", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                await user.click(scope.getByRole("button", { name: "1.x" }));

                const item = screen.getByRole("menuitemcheckbox", { name: /1\.1/ });
                expect(item).toHaveAttribute("aria-checked", "false");
                await user.keyboard("{Escape}");
            });

            it("clicking '1.x' opens dropdown with all top-level income categories", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                await user.click(scope.getByRole("button", { name: "1.x" }));

                await waitFor(() => {
                    expect(
                        screen.getByRole("menuitemcheckbox", {
                            name: /1\.1 Oil & Gas/,
                        }),
                    ).toBeInTheDocument();
                });
                expect(
                    screen.getByRole("menuitemcheckbox", { name: /1\.2 VAT/ }),
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("menuitemcheckbox", { name: /1\.3 Income Tax/ }),
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("menuitemcheckbox", {
                        name: /1\.4 Import Duties/,
                    }),
                ).toBeInTheDocument();
                expect(
                    screen.getByRole("menuitemcheckbox", {
                        name: /1\.5 Other Income/,
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
                const scope = await incomeScope();

                await selectInDropdown(user, trigger1x, /1\.1 Oil & Gas/);

                expect(scope.getByText(/1\.1 Oil & Gas/)).toBeInTheDocument();
            });

            it("selecting a parent shows '1.x.x' with its children", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                await selectInDropdown(user, trigger1x, /1\.1 Oil & Gas/);

                await user.click(scope.getByRole("button", { name: "1.x.x" }));

                await waitFor(() => {
                    expect(
                        screen.getByRole("menuitemcheckbox", { name: /1\.1\.1 Oil/ }),
                    ).toBeInTheDocument();
                });
                expect(
                    screen.getByRole("menuitemcheckbox", { name: /1\.1\.2 Gas/ }),
                ).toBeInTheDocument();
                expect(
                    screen.queryByRole("menuitemcheckbox", {
                        name: /1\.2\.1 Domestic VAT/,
                    }),
                ).not.toBeInTheDocument();
            });

            it("selecting a leaf category hides '1.x.x'", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                await selectInDropdown(user, trigger1x, /1\.5 Other Income/);

                await waitFor(() => {
                    expect(
                        scope.queryByRole("button", { name: "1.x.x" }),
                    ).not.toBeInTheDocument();
                });
            });

            it("selecting both a leaf and a parent keeps '1.x.x' visible", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                await user.click(await trigger1x());
                await user.click(
                    screen.getByRole("menuitemcheckbox", { name: /1\.1 Oil & Gas/ }),
                );
                await user.click(
                    screen.getByRole("menuitemcheckbox", { name: /1\.5 Other Income/ }),
                );
                await user.keyboard("{Escape}");

                expect(
                    scope.getByRole("button", { name: "1.x.x" }),
                ).toBeInTheDocument();
            });

            it("clicking a category badge deselects it and its children", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                await selectInDropdown(user, trigger1x, /1\.1 Oil & Gas/);
                await selectInDropdown(user, trigger1xx, /1\.1\.1 Oil/);

                expect(scope.getByText(/1\.1\.1 Oil/)).toBeInTheDocument();

                await user.click(scope.getByText(/1\.1 Oil & Gas/));

                await waitFor(() => {
                    expect(scope.queryByText(/1\.1\.1 Oil/)).not.toBeInTheDocument();
                });
                expect(scope.queryByText(/1\.1 Oil & Gas/)).not.toBeInTheDocument();
            });

            it("unchecking a parent in dropdown also removes its children", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                await selectInDropdown(user, trigger1x, /1\.1 Oil & Gas/);
                await selectInDropdown(user, trigger1xx, /1\.1\.1 Oil/);

                expect(scope.getByText(/1\.1 Oil & Gas/)).toBeInTheDocument();
                expect(scope.getByText(/1\.1\.1 Oil/)).toBeInTheDocument();

                await selectInDropdown(user, trigger1x, /1\.1 Oil & Gas/);

                await waitFor(() => {
                    expect(scope.queryByText(/1\.1 Oil & Gas/)).not.toBeInTheDocument();
                });
                expect(scope.queryByText(/1\.1\.1 Oil/)).not.toBeInTheDocument();
            });

            it("clicking level clear button removes all categories at that depth and their children", async () => {
                const user = userEvent.setup();
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                await user.click(await trigger1x());
                await user.click(
                    screen.getByRole("menuitemcheckbox", { name: /1\.1 Oil & Gas/ }),
                );
                await user.click(
                    screen.getByRole("menuitemcheckbox", { name: /1\.2 VAT/ }),
                );
                await user.keyboard("{Escape}");

                await selectInDropdown(user, trigger1xx, /1\.1\.1 Oil/);

                expect(scope.getByText(/1\.1 Oil & Gas/)).toBeInTheDocument();
                expect(scope.getByText(/1\.2 VAT/)).toBeInTheDocument();
                expect(scope.getByText(/1\.1\.1 Oil/)).toBeInTheDocument();

                await user.click(
                    scope.getByRole("button", { name: "Clear level 2 categories" }),
                );

                await waitFor(() => {
                    expect(scope.queryByText(/1\.1 Oil & Gas/)).not.toBeInTheDocument();
                });
                expect(scope.queryByText(/1\.2 VAT/)).not.toBeInTheDocument();
                expect(scope.queryByText(/1\.1\.1 Oil/)).not.toBeInTheDocument();
            });
        });

        describe("charts", () => {
            it("renders all four chart titles and treemap/diff placeholders", async () => {
                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                await waitFor(() => {
                    expect(
                        scope.getByText("Income Categories"),
                    ).toBeInTheDocument();
                });
                expect(
                    scope.getByText("Income Category Shares"),
                ).toBeInTheDocument();
                expect(
                    scope.getByText("Income Category Treemap"),
                ).toBeInTheDocument();
                expect(
                    scope.getByText("Income Category Changes"),
                ).toBeInTheDocument();
            });

            it("shows placeholders when there are no income categories", async () => {
                backend.dispatcher.addHandlerOverride(
                    "/api/visualization-data/russia_state_budget",
                    "GET",
                    async () =>
                        new Response(
                            JSON.stringify([
                                [
                                    { year: 2022, number: "2", name: "Expenses, total", value: 31168.5 },
                                ],
                            ]),
                            {
                                status: 200,
                                headers: { "Content-Type": "application/json" },
                            },
                        ),
                );

                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();

                await waitFor(() => {
                    expect(scope.getAllByText("No data available").length).toBe(2);
                });
            });

            it("renders without crashing when no income items in data", async () => {
                backend.dispatcher.addHandlerOverride(
                    "/api/visualization-data/russia_state_budget",
                    "GET",
                    async () =>
                        new Response(
                            JSON.stringify([
                                [{ year: 2022, number: "3", name: "Balance", value: 0 }],
                            ]),
                            {
                                status: 200,
                                headers: { "Content-Type": "application/json" },
                            },
                        ),
                );

                renderWithProviders(<App />, {
                    initialEntries: ["/visualizations/russia_state_budget"],
                });
                const scope = await incomeScope();
                expect(scope.getByText("Select years")).toBeInTheDocument();
            });
        });
    });
});
