import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils";
import { MockBackend } from "../../../../mocks/backend/mock-backend";
import {
    preloadedNullUserState,
    preloadedAdminState,
} from "../../../../mocks/data/store";
import { findProtectedRoutes } from "../../../../util/routes";
import { appRouteElements } from "@/components/app";
import { AnonymousRoute } from "@/components/stateful/protected/anonymous-route";
import { App } from "@/components/app";


const anonymousPaths = findProtectedRoutes(appRouteElements, AnonymousRoute);


let backend: MockBackend;

beforeEach(() => {
    backend = new MockBackend();
    backend.setup();
});


describe("AnonymousRoute", () => {
    it("extracts the expected number of anonymous routes", () => {
        expect(anonymousPaths).toHaveLength(1);
    });

    describe("Fetch error", () => {
        it("displays an error message on network failure", async () => {
            backend.dispatcher.addHandlerOverride(
                "/api/auth/me",
                "GET",
                async () => Response.error(),
            );

            renderWithProviders(<App />, {
                initialEntries: [anonymousPaths[0]],
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
                initialEntries: [anonymousPaths[0]],
            });

            await screen.findByText("Failed to load the page.");
        });
    });

    describe("Authenticated user", () => {
        it("redirects to / when no redirect param is provided", async () => {
            renderWithProviders(<App />, {
                initialEntries: [anonymousPaths[0]],
                preloadedState: preloadedAdminState(),
            });

            await screen.findByRole("heading", {
                name: "Dashboard Visualizations",
            });
        });

        it("redirects to the path specified in the redirect param", async () => {
            renderWithProviders(<App />, {
                initialEntries: [
                    `${anonymousPaths[0]}?redirect=/admin/users`,
                ],
                preloadedState: preloadedAdminState(),
            });

            await screen.findByRole("heading", { name: "Admin: Users" });
        });

        it("falls back to / when redirect param is an external URL", async () => {
            renderWithProviders(<App />, {
                initialEntries: [
                    `${anonymousPaths[0]}?redirect=https://evil.com`,
                ],
                preloadedState: preloadedAdminState(),
            });

            await screen.findByRole("heading", {
                name: "Dashboard Visualizations",
            });
        });
    });

    describe("Anonymous user", () => {
        it("renders children", async () => {
            renderWithProviders(<App />, {
                initialEntries: [anonymousPaths[0]],
                preloadedState: preloadedNullUserState(),
            });

            await screen.findByRole("heading", { name: "Login" });
        });
    });
});
