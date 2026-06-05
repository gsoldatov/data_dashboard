import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { createRoutesFromElements, type RouteObject } from "react-router-dom";
import { renderWithProviders } from "../../../../test-utils";
import { MockBackend } from "../../../../mocks/backend/mock-backend";
import { appRouteElements } from "@/components/app";
import { AdminRoute } from "@/components/stateful/protected/admin-route";
import { App } from "@/components/app";
import type { RootState } from "@/store";


/** Recursively find the `<Route>` whose element is `<AdminRoute />`. */
function findAdminRouteChildren(routes: RouteObject[]): RouteObject[] {
    for (const route of routes) {
        if (
            React.isValidElement(route.element) &&
            route.element.type === AdminRoute
        ) {
            return (route.children as RouteObject[]) ?? [];
        }
        if (route.children) {
            const result = findAdminRouteChildren(
                route.children as RouteObject[],
            );
            if (result) return result;
        }
    }
    throw new Error("AdminRoute not found in route tree");
}


/** Collect leaf paths from a flat list of child routes under a parent path. */
function collectLeafPaths(
    routes: RouteObject[],
    parentPath: string,
): string[] {
    const paths: string[] = [];
    for (const route of routes) {
        if (route.index) continue;
        const currentPath = `${parentPath}/${route.path}`;
        if (route.children && (route.children as RouteObject[]).length > 0) {
            paths.push(
                ...collectLeafPaths(
                    route.children as RouteObject[],
                    currentPath,
                ),
            );
        } else {
            paths.push(currentPath);
        }
    }
    return paths;
}


const routeTree = createRoutesFromElements(appRouteElements);
const adminChildren = findAdminRouteChildren(routeTree);
const adminPaths = collectLeafPaths(adminChildren, "/admin");


function preloadedNullUserState(): Partial<RootState> {
    return {
        api: {
            queries: {
                "getCurrentUser(undefined)": {
                    status: "fulfilled" as const,
                    data: null,
                },
            },
        },
    } as unknown as Partial<RootState>;
}


function preloadedViewerState(): Partial<RootState> {
    return {
        api: {
            queries: {
                "getCurrentUser(undefined)": {
                    status: "fulfilled" as const,
                    data: {
                        id: 1,
                        username: "viewer",
                        role: "viewer" as const,
                        created_at: "2025-01-01T00:00:00Z",
                    },
                },
            },
        },
    } as unknown as Partial<RootState>;
}


function preloadedAdminState(): Partial<RootState> {
    return {
        api: {
            queries: {
                "getCurrentUser(undefined)": {
                    status: "fulfilled" as const,
                    data: {
                        id: 1,
                        username: "admin",
                        role: "admin" as const,
                        created_at: "2025-01-01T00:00:00Z",
                    },
                },
            },
        },
    } as unknown as Partial<RootState>;
}


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
