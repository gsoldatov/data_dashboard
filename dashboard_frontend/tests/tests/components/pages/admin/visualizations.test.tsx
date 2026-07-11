import { describe, it, expect, beforeEach } from "vitest";
import { screen, within, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils";
import { MockBackend } from "../../../../mocks/backend/mock-backend";
import {
    addNetworkErrorOverride,
} from "../../../../mocks/backend/route-handlers/overrides";
import { preloadedAdminState } from "../../../../mocks/mock-data/store";
import { AdminVisualizations } from "@/components/pages/admin/visualizations";
import { VISUALIZATIONS } from "@/util/constants";


const SETTINGS_URL = "/api/visualization-settings/";
const UPSERT_URL_PREFIX = "/api/visualization-settings/";


describe("AdminVisualizations", () => {
    let backend: MockBackend;

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    it("shows error message when the settings query fails", async () => {
        addNetworkErrorOverride(backend.dispatcher, SETTINGS_URL, "GET");

        renderWithProviders(<AdminVisualizations />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(
                screen.getByText("Failed to load the page."),
            ).toBeInTheDocument();
        });
    });

    it("renders table with visualization name and published toggle", async () => {
        renderWithProviders(<AdminVisualizations />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(
                screen.getByText("Russia State Budget"),
            ).toBeInTheDocument();
        });

        const switches = screen.getAllByRole("switch");
        expect(switches).toHaveLength(6);
    });

    it("toggles is_published on switch click and updates the display", async () => {
        renderWithProviders(<AdminVisualizations />, {
            preloadedState: preloadedAdminState(),
        });

        const title = "Russia Inflation";

        await waitFor(() => {
            expect(
                screen.getByText("Russia State Budget"),
            ).toBeInTheDocument();
        });

        const row = screen.getByText(title).closest("tr")!;
        const switchEl = within(row).getByRole("switch");
        expect(switchEl).toHaveAttribute("data-state", "checked");

        fireEvent.click(switchEl);

        await waitFor(() => {
            expect(switchEl).toHaveAttribute("data-state", "unchecked");
        });
    });

    it("reverts toggle on upsert failure", async () => {
        renderWithProviders(<AdminVisualizations />, {
            preloadedState: preloadedAdminState(),
        });

        const title = "Russia Inflation";
        const slug = VISUALIZATIONS.find((v) => v.title === title)!.slug;

        await waitFor(() => {
            expect(
                screen.getByText("Russia State Budget"),
            ).toBeInTheDocument();
        });

        const row = screen.getByText(title).closest("tr")!;
        const switchEl = within(row).getByRole("switch");
        expect(switchEl).toHaveAttribute("data-state", "checked");

        // Override the PUT to fail for this visualization
        addNetworkErrorOverride(
            backend.dispatcher,
            `${UPSERT_URL_PREFIX}${slug}`,
            "PUT",
        );

        fireEvent.click(switchEl);

        await waitFor(() => {
            expect(switchEl).toHaveAttribute("data-state", "checked");
        });
    });

    it("filters visualizations by title prefix (case-insensitive)", async () => {
        renderWithProviders(<AdminVisualizations />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(
                screen.getByText("Russia State Budget"),
            ).toBeInTheDocument();
        });

        const filterInput = screen.getByPlaceholderText("Filter by title…");

        // Prefix match — should show all six
        fireEvent.change(filterInput, { target: { value: "russia" } });
        await waitFor(() => {
            expect(
                screen.getByText("Russia GDP"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Russia Inflation"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Russia State Budget"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Russia Labor Market"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Russia Trade"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Russia Economy Dashboard"),
            ).toBeInTheDocument();
        });

        // No match
        fireEvent.change(filterInput, { target: { value: "zzz" } });
        await waitFor(() => {
            expect(
                screen.queryByText("Russia GDP"),
            ).toBeNull();
            expect(
                screen.queryByText("Russia Inflation"),
            ).toBeNull();
            expect(
                screen.queryByText("Russia State Budget"),
            ).toBeNull();
            expect(
                screen.queryByText("Russia Labor Market"),
            ).toBeNull();
            expect(
                screen.queryByText("Russia Trade"),
            ).toBeNull();
            expect(
                screen.queryByText("Russia Economy Dashboard"),
            ).toBeNull();
        });

        // Clear filter — shows all again
        fireEvent.change(filterInput, { target: { value: "" } });
        await waitFor(() => {
            expect(
                screen.getByText("Russia GDP"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Russia Inflation"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Russia State Budget"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Russia Labor Market"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Russia Trade"),
            ).toBeInTheDocument();
            expect(
                screen.getByText("Russia Economy Dashboard"),
            ).toBeInTheDocument();
        });
    });
});
