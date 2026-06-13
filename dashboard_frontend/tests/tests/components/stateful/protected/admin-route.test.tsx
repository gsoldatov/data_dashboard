import { describe, it, expect, beforeEach } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils";
import { MockBackend } from "../../../../mocks/backend/mock-backend";
import {
    addNetworkErrorOverride,
    add500Override,
} from "../../../../mocks/backend/route-handlers/overrides";
import {
    preloadedNullUserState,
    preloadedViewerState,
    preloadedAdminState,
} from "../../../../mocks/mock-data/store";
import { findProtectedRoutes } from "../../../../util/routes";
import { appRouteElements } from "@/components/app";
import { AdminRoute } from "@/components/stateful/protected/admin-route";
import { App } from "@/components/app";


const adminPaths = findProtectedRoutes(appRouteElements, AdminRoute);


let backend: MockBackend;

beforeEach(() => {
    backend = new MockBackend();
    backend.setup();
});


describe("AdminRoute", () => {
    it("extracts the expected number of admin routes", () => {
        expect(adminPaths).toHaveLength(2);
    });

    describe("Fetch error", () => {
        it("displays an error message on network failure", async () => {
            addNetworkErrorOverride(
                backend.dispatcher,
                "/api/auth/me",
                "GET",
            );

            renderWithProviders(<App />, {
                initialEntries: [adminPaths[0]],
            });

            await screen.findByText("Failed to load the page.");
        });

        it("displays an error message on 500", async () => {
            add500Override(backend.dispatcher, "/api/auth/me", "GET");

            renderWithProviders(<App />, {
                initialEntries: [adminPaths[0]],
            });

            await screen.findByText("Failed to load the page.");
        });
    });

    describe("Anonymous user", () => {
        it("redirects to /login from all admin routes", async () => {
            for (const path of adminPaths) {
                cleanup();
                renderWithProviders(<App />, {
                    initialEntries: [path],
                    preloadedState: preloadedNullUserState(),
                });

                await screen.findByRole("heading", { name: "Login" });
            }
        });
    });

    describe("Viewer user", () => {
        it("redirects to / from all admin routes", async () => {
            for (const path of adminPaths) {
                cleanup();
                renderWithProviders(<App />, {
                    initialEntries: [path],
                    preloadedState: preloadedViewerState(),
                });

                await screen.findByRole("heading", {
                    name: "Dashboard Visualizations",
                });
            }
        });
    });

    describe("Admin user", () => {
        it("renders children for all admin routes", () => {
            for (const path of adminPaths) {
                cleanup();
                renderWithProviders(<App />, {
                    initialEntries: [path],
                    preloadedState: preloadedAdminState(),
                });

                expect(
                    screen.queryByText("Failed to load the page."),
                ).toBeNull();
                expect(
                    screen.getByRole("link", { name: "ETL" }),
                ).toBeInTheDocument();
                const links = screen.getAllByRole("link", {
                    name: "Visualizations",
                });
                const adminVizLink = links.find(
                    (l) => l.getAttribute("href") === "/admin/visualizations",
                );
                expect(adminVizLink).toBeInTheDocument();
            }
        });
    });
});
