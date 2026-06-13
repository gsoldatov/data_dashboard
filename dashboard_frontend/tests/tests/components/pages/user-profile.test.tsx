import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { MockBackend } from "../../../mocks/backend/mock-backend";
import {
    addNetworkErrorOverride,
    add500Override,
} from "../../../mocks/backend/route-handlers/overrides";
import {
    preloadedNullUserState,
    preloadedViewerState,
} from "../../../mocks/mock-data/store";
import { App } from "@/components/app";


let backend: MockBackend;

beforeEach(() => {
    backend = new MockBackend();
    backend.setup();
});


/** Override the /api/auth/me handler so preloaded authenticated state is not cleared. */
function overrideMeHandler(user: { id: number; username: string; role: string; created_at: string }): void {
    backend.dispatcher.addHandlerOverride("/api/auth/me", "GET", async () =>
        new Response(JSON.stringify(user), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        }),
    );
    backend.dispatcher.xIsAuthenticated = true;
}


/** Fill the profile form fields and click the submit button. */
async function fillAndSubmitProfileForm(
    overrides: {
        username?: string;
        newPassword?: string;
        newPasswordRepeat?: string;
        currentPassword?: string;
    } = {},
): Promise<void> {
    const defaults = {
        username: "viewer",
        newPassword: "",
        newPasswordRepeat: "",
        currentPassword: "pass",
    };
    const values = { ...defaults, ...overrides };

    fireEvent.change(screen.getByLabelText("Username"), {
        target: { value: values.username },
    });
    if (values.newPassword || overrides.newPassword !== undefined) {
        fireEvent.change(screen.getByLabelText("New Password"), {
            target: { value: values.newPassword },
        });
    }
    if (values.newPasswordRepeat || overrides.newPasswordRepeat !== undefined) {
        fireEvent.change(screen.getByLabelText("Repeat New Password"), {
            target: { value: values.newPasswordRepeat },
        });
    }
    fireEvent.change(screen.getByLabelText("Current Password"), {
        target: { value: values.currentPassword },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save Changes" }));
}


describe("UserProfile", () => {
    describe("Auth & loading", () => {
        it("redirects to /login when not authenticated", async () => {
            const { location } = renderWithProviders(<App />, {
                initialEntries: ["/user-profile"],
                preloadedState: preloadedNullUserState(),
            });

            await waitFor(() => {
                expect(location.current?.pathname).toBe("/login");
            });
        });

        it("renders profile page for authenticated viewer", () => {
            overrideMeHandler({
                id: 1,
                username: "viewer",
                role: "viewer",
                created_at: "2025-01-01T00:00:00Z",
            });

            renderWithProviders(<App />, {
                initialEntries: ["/user-profile"],
                preloadedState: preloadedViewerState(),
            });

            expect(
                screen.getByRole("heading", { name: "User Profile" }),
            ).toBeInTheDocument();
            expect(
                screen.getByLabelText("Username"),
            ).toHaveValue("viewer");
        });
    });

    describe("Form validation", () => {
        it("displays error for empty current password", async () => {
            overrideMeHandler({
                id: 1,
                username: "viewer",
                role: "viewer",
                created_at: "2025-01-01T00:00:00Z",
            });

            renderWithProviders(<App />, {
                initialEntries: ["/user-profile"],
                preloadedState: preloadedViewerState(),
            });

            await fillAndSubmitProfileForm({ currentPassword: "" });

            await waitFor(() => {
                expect(
                    screen.getByText("Current password is required."),
                ).toBeInTheDocument();
            });
        });

        it("displays error when passwords do not match", async () => {
            overrideMeHandler({
                id: 1,
                username: "viewer",
                role: "viewer",
                created_at: "2025-01-01T00:00:00Z",
            });

            renderWithProviders(<App />, {
                initialEntries: ["/user-profile"],
                preloadedState: preloadedViewerState(),
            });

            await fillAndSubmitProfileForm({
                newPassword: "abc",
                newPasswordRepeat: "xyz",
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Passwords do not match."),
                ).toBeInTheDocument();
            });
        });
    });

    describe("Errors", () => {
        it("displays generic error on network error during submit", async () => {
            overrideMeHandler({
                id: 1,
                username: "viewer",
                role: "viewer",
                created_at: "2025-01-01T00:00:00Z",
            });

            addNetworkErrorOverride(
                backend.dispatcher,
                "/api/users/{id}",
                "PATCH",
            );

            renderWithProviders(<App />, {
                initialEntries: ["/user-profile"],
                preloadedState: preloadedViewerState(),
            });

            await fillAndSubmitProfileForm();

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to update user data."),
                ).toBeInTheDocument();
            });
        });

        it("displays 'Incorrect current password.' on 400", async () => {
            overrideMeHandler({
                id: 1,
                username: "viewer",
                role: "viewer",
                created_at: "2025-01-01T00:00:00Z",
            });

            backend.dispatcher.addHandlerOverride(
                "/api/users/{id}",
                "PATCH",
                async () =>
                    new Response(
                        JSON.stringify({
                            detail: "Incorrect current password",
                        }),
                        {
                            status: 400,
                            headers: { "Content-Type": "application/json" },
                        },
                    ),
            );

            renderWithProviders(<App />, {
                initialEntries: ["/user-profile"],
                preloadedState: preloadedViewerState(),
            });

            await fillAndSubmitProfileForm({ currentPassword: "wrong" });

            await waitFor(() => {
                expect(
                    screen.getByText("Incorrect current password."),
                ).toBeInTheDocument();
            });
        });

        it("displays 'Username is unavailable.' on 409", async () => {
            overrideMeHandler({
                id: 1,
                username: "viewer",
                role: "viewer",
                created_at: "2025-01-01T00:00:00Z",
            });

            backend.dispatcher.addHandlerOverride(
                "/api/users/{id}",
                "PATCH",
                async () =>
                    new Response(
                        JSON.stringify({ detail: "User username taken" }),
                        {
                            status: 409,
                            headers: { "Content-Type": "application/json" },
                        },
                    ),
            );

            renderWithProviders(<App />, {
                initialEntries: ["/user-profile"],
                preloadedState: preloadedViewerState(),
            });

            await fillAndSubmitProfileForm({ username: "taken" });

            await waitFor(() => {
                expect(
                    screen.getByText("Username is unavailable."),
                ).toBeInTheDocument();
            });
        });

        it("displays 'Failed to update user data.' on 500", async () => {
            overrideMeHandler({
                id: 1,
                username: "viewer",
                role: "viewer",
                created_at: "2025-01-01T00:00:00Z",
            });

            add500Override(
                backend.dispatcher,
                "/api/users/{id}",
                "PATCH",
            );

            renderWithProviders(<App />, {
                initialEntries: ["/user-profile"],
                preloadedState: preloadedViewerState(),
            });

            await fillAndSubmitProfileForm();

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to update user data."),
                ).toBeInTheDocument();
            });
        });
    });

    describe("Success", () => {
        it("displays success message after updating username", async () => {
            overrideMeHandler({
                id: 1,
                username: "viewer",
                role: "viewer",
                created_at: "2025-01-01T00:00:00Z",
            });

            backend.dispatcher.addHandlerOverride(
                "/api/users/{id}",
                "PATCH",
                async (req: Request) => {
                    const body: unknown = await req.json();
                    const { username } = body as { username: string };

                    return new Response(
                        JSON.stringify({
                            id: 1,
                            username,
                            role: "viewer",
                            created_at: "2025-01-01T00:00:00Z",
                        }),
                        {
                            status: 200,
                            headers: { "Content-Type": "application/json" },
                        },
                    );
                },
            );

            renderWithProviders(<App />, {
                initialEntries: ["/user-profile"],
                preloadedState: preloadedViewerState(),
            });

            await fillAndSubmitProfileForm({ username: "new_viewer" });

            await waitFor(() => {
                expect(
                    screen.getByText("Profile updated."),
                ).toBeInTheDocument();
            });
        });

        it("displays success message after updating password", async () => {
            overrideMeHandler({
                id: 1,
                username: "viewer",
                role: "viewer",
                created_at: "2025-01-01T00:00:00Z",
            });

            renderWithProviders(<App />, {
                initialEntries: ["/user-profile"],
                preloadedState: preloadedViewerState(),
            });

            await fillAndSubmitProfileForm({
                newPassword: "newpass",
                newPasswordRepeat: "newpass",
                currentPassword: "pass",
            });

            await waitFor(() => {
                expect(
                    screen.getByText("Profile updated."),
                ).toBeInTheDocument();
            });

            // Password fields should be cleared after success
            expect(screen.getByLabelText("Current Password")).toHaveValue("");
            expect(screen.getByLabelText("New Password")).toHaveValue("");
            expect(screen.getByLabelText("Repeat New Password")).toHaveValue("");
        });

        it("succeeds with unchanged username and no password", async () => {
            overrideMeHandler({
                id: 1,
                username: "viewer",
                role: "viewer",
                created_at: "2025-01-01T00:00:00Z",
            });

            renderWithProviders(<App />, {
                initialEntries: ["/user-profile"],
                preloadedState: preloadedViewerState(),
            });

            await fillAndSubmitProfileForm();

            await waitFor(() => {
                expect(
                    screen.getByText("Profile updated."),
                ).toBeInTheDocument();
            });
        });
    });
});
