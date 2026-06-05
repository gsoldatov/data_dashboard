import { describe, it, expect, beforeEach } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils";
import { MockBackend } from "../../../../mocks/backend/mock-backend";
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
        expect(adminPaths).toHaveLength(3);
    });

    describe("Fetch error", () => {
        it("displays an error message on network failure", async () => {
            backend.dispatcher.addHandlerOverride(
                "/api/auth/me",
                "GET",
                async () => Response.error(),
            );

            renderWithProviders(<App />, {
                initialEntries: [adminPaths[0]],
            });

            await screen.findByText("Failed to load the page.");
        });

        it("displays an error message on 500", async () => {
            backend.dispatcher.addHandlerOverride(
                "/api/auth/me",
                "GET",
                async () =>
                    new Response(null, { status: 500 }),
            );

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
                    screen.getByRole("heading", { name: /^Admin:/ }),
                ).toBeInTheDocument();
                expect(
                    screen.queryByText("Failed to load the page."),
                ).toBeNull();
            }
        });
    });
});
