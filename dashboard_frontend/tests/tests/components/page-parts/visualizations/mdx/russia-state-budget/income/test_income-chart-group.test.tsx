import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../../../../test-utils";
import { MockBackend } from "../../../../../../../mocks/backend/mock-backend";
import { IncomeChartGroup } from "@/components/page-parts/visualizations/mdx/russia-state-budget/income/income-chart-group";

describe("IncomeChartGroup", () => {
    let backend: MockBackend;

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    const render = () => {
        const result = renderWithProviders(<IncomeChartGroup />);
        const scope = within(result.container);
        return { ...result, scope };
    };

    /** Open a dropdown, click a checkbox item, then press Escape to close. */
    const selectInDropdown = async (
        user: ReturnType<typeof userEvent.setup>,
        trigger: () => HTMLElement,
        checkboxLabel: string | RegExp,
    ) => {
        await user.click(trigger());
        await user.click(screen.getByRole("menuitemcheckbox", { name: checkboxLabel }));
        // Close dropdown via Escape
        await user.keyboard("{Escape}");
        // Wait for the dropdown portal to close and aria-hidden to be removed
        await waitFor(() => {
            expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        });
    };

    // ── Year selector ────────────────────────────────────────────────────

    it("renders the year dropdown trigger", async () => {
        const { scope } = render();
        await waitFor(() => {
            expect(scope.getByText("Years")).toBeInTheDocument();
        });
    });

    it("shows all available years in the dropdown", async () => {
        const user = userEvent.setup();
        render();

        await waitFor(() => {
            expect(screen.getByText("Years")).toBeInTheDocument();
        });

        await user.click(screen.getByText("Years"));

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
        const { scope } = render();
        await waitFor(() => {
            expect(scope.getByText("Years")).toBeInTheDocument();
        });

        expect(
            scope.queryByRole("button", { name: "Clear all years" }),
        ).not.toBeInTheDocument();
    });

    it("toggling a year off shows badge row with remaining years", async () => {
        const user = userEvent.setup();
        const { scope } = render();

        await waitFor(() => {
            expect(scope.getByText("Years")).toBeInTheDocument();
        });

        const trigger = () => scope.getByText("Years");
        await selectInDropdown(user, trigger, "2024");

        expect(scope.getByText("2022")).toBeInTheDocument();
        expect(scope.getByText("2023")).toBeInTheDocument();
        expect(scope.queryByText("2024")).not.toBeInTheDocument();
    });

    it("clicking a year badge removes that year from selection", async () => {
        const user = userEvent.setup();
        const { scope } = render();

        await waitFor(() => {
            expect(scope.getByText("Years")).toBeInTheDocument();
        });

        const trigger = () => scope.getByText("Years");
        await selectInDropdown(user, trigger, "2024");

        // Now 2022 and 2023 badges visible
        expect(scope.getByText("2022")).toBeInTheDocument();
        expect(scope.getByText("2023")).toBeInTheDocument();

        // Click 2022 badge to remove it
        await user.click(scope.getByText("2022"));

        await waitFor(() => {
            expect(scope.queryByText("2022")).not.toBeInTheDocument();
        });
        expect(scope.getByText("2023")).toBeInTheDocument();
    });

    it("clear all years button removes all year badges", async () => {
        const user = userEvent.setup();
        const { scope } = render();

        await waitFor(() => {
            expect(scope.getByText("Years")).toBeInTheDocument();
        });

        const trigger = () => scope.getByText("Years");
        await selectInDropdown(user, trigger, "2023");

        expect(scope.getByText("2022")).toBeInTheDocument();
        expect(scope.getByText("2024")).toBeInTheDocument();

        await user.click(
            scope.getByRole("button", { name: "Clear all years" }),
        );

        await waitFor(() => {
            expect(scope.queryByText(/202\d/)).not.toBeInTheDocument();
        });
    });

    // ── Category breadcrumb ──────────────────────────────────────────────

    it("renders the Income breadcrumb segment", async () => {
        const { scope } = render();
        await waitFor(() => {
            expect(scope.getByText("Income")).toBeInTheDocument();
        });
    });

    it("clicking Income opens dropdown with top-level income categories", async () => {
        const user = userEvent.setup();
        const { scope } = render();

        await waitFor(() => {
            expect(scope.getByText("Income")).toBeInTheDocument();
        });

        await user.click(scope.getByText("Income"));

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

    // ── Category selection → badges ───────────────────────────────────────

    it("selecting a top-level category shows it as a badge", async () => {
        const user = userEvent.setup();
        const { scope } = render();

        await waitFor(() => {
            expect(scope.getByText("Income")).toBeInTheDocument();
        });

        const trigger = () => scope.getByText("Income");
        await selectInDropdown(user, trigger, /1\.1 Oil & Gas/);

        expect(scope.getByText(/1\.1 Oil & Gas/)).toBeInTheDocument();
    });

    it("selecting a single category with children drills down", async () => {
        const user = userEvent.setup();
        const { scope } = render();

        await waitFor(() => {
            expect(scope.getByText("Income")).toBeInTheDocument();
        });

        const trigger = () => scope.getByText("Income");
        await selectInDropdown(user, trigger, /1\.1 Oil & Gas/);

        // After selecting "1.1", breadcrumb shows "Oil & Gas" segment
        expect(scope.getByText("Oil & Gas")).toBeInTheDocument();

        // "1.1 Oil & Gas" badge visible
        expect(scope.getByText(/1\.1 Oil & Gas/)).toBeInTheDocument();
    });

    it("clicking the child-level breadcrumb shows child categories", async () => {
        const user = userEvent.setup();
        const { scope } = render();

        await waitFor(() => {
            expect(scope.getByText("Income")).toBeInTheDocument();
        });

        // Select "1.1" first
        const incomeTrigger = () => scope.getByText("Income");
        await selectInDropdown(user, incomeTrigger, /1\.1 Oil & Gas/);

        // Click the "Oil & Gas" breadcrumb to open its dropdown
        await user.click(scope.getByText("Oil & Gas"));

        await waitFor(() => {
            expect(
                screen.getByRole("menuitemcheckbox", { name: /1\.1\.1 Oil/ }),
            ).toBeInTheDocument();
        });
        expect(
            screen.getByRole("menuitemcheckbox", { name: /1\.1\.2 Gas/ }),
        ).toBeInTheDocument();
    });

    // ── Badge deselection ─────────────────────────────────────────────────

    it("clicking a category badge deselects it and its children", async () => {
        const user = userEvent.setup();
        const { scope } = render();

        await waitFor(() => {
            expect(scope.getByText("Income")).toBeInTheDocument();
        });

        // Select "1.1"
        const incomeTrigger = () => scope.getByText("Income");
        await selectInDropdown(user, incomeTrigger, /1\.1 Oil & Gas/);

        // Select "1.1.1" via the Oil & Gas dropdown
        const ogTrigger = () => scope.getByText("Oil & Gas");
        await selectInDropdown(user, ogTrigger, /1\.1\.1 Oil/);

        expect(scope.getByText(/1\.1\.1 Oil/)).toBeInTheDocument();

        // Click the "1.1 Oil & Gas" badge to deselect it and children
        await user.click(scope.getByText(/1\.1 Oil & Gas/));

        await waitFor(() => {
            expect(scope.queryByText(/1\.1\.1 Oil/)).not.toBeInTheDocument();
        });
        expect(scope.queryByText(/1\.1 Oil & Gas/)).not.toBeInTheDocument();
    });

    // ── Level clear button ────────────────────────────────────────────────

    it("clicking level clear button removes all categories at that depth", async () => {
        const user = userEvent.setup();
        const { scope } = render();

        await waitFor(() => {
            expect(scope.getByText("Income")).toBeInTheDocument();
        });

        // Select two depth-2 categories in the same dropdown session
        const incomeTrigger = () => scope.getByText("Income");
        await user.click(incomeTrigger());
        await user.click(
            screen.getByRole("menuitemcheckbox", { name: /1\.1 Oil & Gas/ }),
        );
        await user.click(
            screen.getByRole("menuitemcheckbox", { name: /1\.2 VAT/ }),
        );
        await user.keyboard("{Escape}");

        expect(scope.getByText(/1\.1 Oil & Gas/)).toBeInTheDocument();
        expect(scope.getByText(/1\.2 VAT/)).toBeInTheDocument();

        await user.click(
            scope.getByRole("button", { name: "Clear level 2 categories" }),
        );

        await waitFor(() => {
            expect(scope.queryByText(/1\.1 Oil & Gas/)).not.toBeInTheDocument();
        });
        expect(scope.queryByText(/1\.2 VAT/)).not.toBeInTheDocument();
    });

    // ── Empty data ────────────────────────────────────────────────────────

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

        const { scope } = render();
        await waitFor(() => {
            expect(scope.getByText("Years")).toBeInTheDocument();
        });
    });
});
