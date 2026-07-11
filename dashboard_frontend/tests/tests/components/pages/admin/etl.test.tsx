import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils";
import { MockBackend } from "../../../../mocks/backend/mock-backend";
import {
    addNetworkErrorOverride,
} from "../../../../mocks/backend/route-handlers/overrides";
import { preloadedAdminState } from "../../../../mocks/mock-data/store";
import { createMockDagListResponse } from "../../../../mocks/mock-data/airflow";
import { AdminEtl } from "@/components/pages/admin/etl";


const DAGS_URL = "/api/airflow/dags";


describe("AdminEtl", () => {
    let backend: MockBackend;

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    it("shows error message when the DAGs query fails", async () => {
        addNetworkErrorOverride(backend.dispatcher, DAGS_URL, "GET");

        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(
                screen.getByText("Failed to fetch DAGs information."),
            ).toBeInTheDocument();
        });
    });

    it("renders table with DAG rows and pagination", async () => {
        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(screen.getByText("dag_001")).toBeInTheDocument();
        });

        // First page has 10 items
        expect(screen.getByText("dag_010")).toBeInTheDocument();

        // Pagination visible (25 total, 10 per page → 3 pages)
        expect(screen.getByText("Next")).toBeInTheDocument();
    });

    it("navigates to page 2 when Next is clicked", async () => {
        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(screen.getByText("dag_001")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByText("Next"));

        await waitFor(() => {
            // Page 2 has items 11-20
            expect(screen.getByText("dag_011")).toBeInTheDocument();
            expect(screen.getByText("dag_020")).toBeInTheDocument();
        });
    });

    it("displays ExternalLink icons linking to Airflow", async () => {
        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(screen.getByText("dag_001")).toBeInTheDocument();
        });

        const link = screen.getByLabelText("Open dag_001 in Airflow");
        expect(link).toHaveAttribute("href", "http://localhost:14001/dags/dag_001");
    });

    it("reads initial page from URL search param", async () => {
        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
            initialEntries: ["/admin/etl?page=2"],
        });

        await waitFor(() => {
            // Page 2 has items 11-20
            expect(screen.getByText("dag_011")).toBeInTheDocument();
        });

        expect(screen.queryByText("dag_001")).toBeNull();
    });

    it("defaults to page 1 for invalid page param", async () => {
        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
            initialEntries: ["/admin/etl?page=abc"],
        });

        await waitFor(() => {
            expect(screen.getByText("dag_001")).toBeInTheDocument();
        });
    });

    it("hides pagination when only one page of DAGs", async () => {
        // Override to return only 5 DAGs (fits on one page of 10)
        backend.dispatcher.addHandlerOverride(
            DAGS_URL,
            "GET",
            async (req) => {
                const url = new URL(req.url);
                const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);
                const offset = parseInt(url.searchParams.get("offset") ?? "0", 10);

                const body = createMockDagListResponse(limit, offset, 5);

                return new Response(JSON.stringify(body), {
                    status: 200,
                    headers: { "Content-Type": "application/json" },
                });
            },
        );

        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(screen.getByText("dag_001")).toBeInTheDocument();
        });

        expect(screen.queryByRole("navigation", { name: "pagination" })).toBeNull();
    });

    it("Refresh button is visible in error state", async () => {
        addNetworkErrorOverride(backend.dispatcher, DAGS_URL, "GET");

        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(
                screen.getByText("Failed to fetch DAGs information."),
            ).toBeInTheDocument();
        });

        expect(screen.getByText("Refresh")).toBeInTheDocument();
    });

    it("Refresh button is visible during loading", () => {
        // Don't resolve the fetch so we stay in loading state
        backend.dispatcher.addHandlerOverride(
            DAGS_URL,
            "GET",
            () => new Promise(() => {}),
        );

        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
        });

        expect(screen.getByText("Refresh")).toBeInTheDocument();
    });

    it("renders switches reflecting DAG active state", async () => {
        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(screen.getByText("dag_001")).toBeInTheDocument();
        });

        const switches = screen.getAllByRole("switch");
        expect(switches).toHaveLength(10);

        // dag_001: is_paused=true → switch OFF
        expect(switches[0]).toHaveAttribute("data-state", "unchecked");
        // dag_002: is_paused=false → switch ON
        expect(switches[1]).toHaveAttribute("data-state", "checked");
        // dag_004: is_paused=true → switch OFF
        expect(switches[3]).toHaveAttribute("data-state", "unchecked");
    });

    it("toggles switch optimistically on click", async () => {
        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(screen.getByText("dag_001")).toBeInTheDocument();
        });

        // dag_001 is paused → switch is OFF (unchecked)
        const switchEl = screen.getAllByRole("switch")[0];
        expect(switchEl).toHaveAttribute("data-state", "unchecked");

        fireEvent.click(switchEl);

        await waitFor(() => {
            expect(switchEl).toHaveAttribute("data-state", "checked");
        });
    });

    it("reverts toggle on update failure", async () => {
        renderWithProviders(<AdminEtl />, {
            preloadedState: preloadedAdminState(),
        });

        await waitFor(() => {
            expect(screen.getByText("dag_002")).toBeInTheDocument();
        });

        // dag_002 is active → switch is ON (checked)
        const switchEl = screen.getAllByRole("switch")[1];
        expect(switchEl).toHaveAttribute("data-state", "checked");

        addNetworkErrorOverride(
            backend.dispatcher,
            "/api/airflow/dags/dag_002",
            "PATCH",
        );

        fireEvent.click(switchEl);

        await waitFor(() => {
            expect(switchEl).toHaveAttribute("data-state", "checked");
        });
    });
});
