import { describe, it, expect, beforeEach } from "vitest";
import { screen, within, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils";
import { MockBackend } from "../../../../mocks/backend/mock-backend";
import {
    addNetworkErrorOverride,
} from "../../../../mocks/backend/route-handlers/overrides";
import { preloadedAdminState } from "../../../../mocks/mock-data/store";
import { AdminVisualizations } from "@/components/pages/admin/visualizations";
import { AdminVisualizationsContent } from "@/components/page-parts/admin/visualizations";
import { VISUALIZATIONS } from "@/util/constants";
import type { VisualizationInfo } from "@/types/visualization-settings";
import type { BatchVisualizationSettingsResponse } from "@/types/backend/responses/visualization-settings";


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

        const title = "Russia Economy Dashboard";

        await waitFor(() => {
            expect(
                screen.getByText(title),
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

        const title = "Russia Economy Dashboard";
        const slug = VISUALIZATIONS.find((v) => v.title === title)!.slug;

        await waitFor(() => {
            expect(
                screen.getByText(title),
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

    it("filters visualizations by title substring (case-insensitive)", async () => {
        renderWithProviders(<AdminVisualizations />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(
                screen.getByText("Russia State Budget"),
            ).toBeInTheDocument();
        });

        const filterInput = screen.getByPlaceholderText("Filter by title…");

        // Substring match — all six match "russia"
        fireEvent.change(filterInput, { target: { value: "russia" } });
        await waitFor(() => {
            expect(
                screen.getByText("Russia Economy Dashboard"),
            ).toBeInTheDocument();
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
        });

        // Substring match — only "Russia GDP" matches "gdp"
        fireEvent.change(filterInput, { target: { value: "gdp" } });
        await waitFor(() => {
            expect(
                screen.getByText("Russia GDP"),
            ).toBeInTheDocument();
            expect(
                screen.queryByText("Russia Inflation"),
            ).toBeNull();
        });

        // No match
        fireEvent.change(filterInput, { target: { value: "zzz" } });
        await waitFor(() => {
            expect(
                screen.queryByText("Russia Economy Dashboard"),
            ).toBeNull();
        });

        // Clear filter — shows all again
        fireEvent.change(filterInput, { target: { value: "" } });
        await waitFor(() => {
            expect(
                screen.getByText("Russia Economy Dashboard"),
            ).toBeInTheDocument();
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
        });
    });

    it("paginates when there are more than 10 visualizations", async () => {
        const mockViz: VisualizationInfo[] = Array.from({ length: 15 }, (_, i) => ({
            slug: `viz-${i}`,
            title: `Visualization ${i + 1}`,
            icon: () => null,
        }));
        const mockSettings: BatchVisualizationSettingsResponse = {};
        for (const v of mockViz) {
            mockSettings[v.slug] = { is_published: true };
        }

        renderWithProviders(
            <AdminVisualizationsContent settings={mockSettings} visualizations={mockViz} />,
            { preloadedState: preloadedAdminState() },
        );

        // Page 1: items 1–10
        await waitFor(() => {
            expect(screen.getByText("Visualization 1")).toBeInTheDocument();
            expect(screen.getByText("Visualization 10")).toBeInTheDocument();
        });
        expect(screen.queryByText("Visualization 11")).toBeNull();

        // Navigate to page 2
        fireEvent.click(screen.getByLabelText("Go to next page"));
        await waitFor(() => {
            expect(screen.getByText("Visualization 11")).toBeInTheDocument();
            expect(screen.getByText("Visualization 15")).toBeInTheDocument();
        });
        expect(screen.queryByText("Visualization 1")).toBeNull();
    });
});