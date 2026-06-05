import { describe, it, expect, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { MockBackend } from "../../../mocks/backend/mock-backend";
import {
    addNetworkErrorOverride,
    add500Override,
} from "../../../mocks/backend/route-handlers/overrides";
import {
    preloadedNullUserState,
    preloadedViewerState,
    preloadedAdminState,
} from "../../../mocks/mock-data/store";
import { Navbar } from "@/components/stateful/navbar";


let backend: MockBackend;

beforeEach(() => {
    backend = new MockBackend();
    backend.setup();
});


describe("Navbar", () => {
    describe("Fetch error", () => {
        it("shows the login link on network failure", async () => {
            addNetworkErrorOverride(backend.dispatcher, "/api/auth/me", "GET");
            renderWithProviders(<Navbar />);
            await screen.findByText("Login");
        });

        it("shows the login link on 500", async () => {
            add500Override(backend.dispatcher, "/api/auth/me", "GET");
            renderWithProviders(<Navbar />);
            await screen.findByText("Login");
        });
    });

    describe("Null user", () => {
        it("shows login link and hides authenticated links", () => {
            renderWithProviders(<Navbar />, {
                preloadedState: preloadedNullUserState(),
            });

            expect(screen.getByText("Login")).toBeInTheDocument();
            expect(screen.queryByText("Logout")).toBeNull();
            expect(screen.queryByText("Admin")).toBeNull();
        });
    });

    describe("Viewer user", () => {
        beforeEach(() => {
            renderWithProviders(<Navbar />, {
                preloadedState: preloadedViewerState(),
            });
        });

        it("shows the username", () => {
            expect(screen.getByText("viewer")).toBeInTheDocument();
        });

        it("does not show admin links", () => {
            expect(screen.queryByText("Admin")).toBeNull();
        });

        it("shows the logout button", () => {
            expect(screen.getByText("Logout")).toBeInTheDocument();
        });

        it("hides the login link", () => {
            expect(screen.queryByText("Login")).toBeNull();
        });
    });

    describe("Admin user", () => {
        beforeEach(() => {
            renderWithProviders(<Navbar />, {
                preloadedState: preloadedAdminState(),
            });
        });

        it("shows the username", () => {
            expect(screen.getByText("admin")).toBeInTheDocument();
        });

        it("shows admin links in both menu and secondary menu", () => {
            expect(screen.getByText("Admin")).toBeInTheDocument();
            const adminLinks = screen
                .getAllByRole("link")
                .filter((a) => a.getAttribute("href") === "/admin/visualizations");
            expect(adminLinks).toHaveLength(2);
        });

        it("shows the logout button", () => {
            expect(screen.getByText("Logout")).toBeInTheDocument();
        });

        it("hides the login link", () => {
            expect(screen.queryByText("Login")).toBeNull();
        });
    });

    describe("Logout", () => {
        it("redirects to / and shows the login link after logout", async () => {
            renderWithProviders(<Navbar />, {
                preloadedState: preloadedAdminState(),
                initialEntries: ["/some-page"],
            });

            fireEvent.click(screen.getByText("Logout"));
            await screen.findByText("Login");
            expect(screen.queryByText("admin")).toBeNull();
        });
    });
});
