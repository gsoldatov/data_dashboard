import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { MockBackend } from "../../../mocks/backend/mock-backend";
import { preloadedNullUserState } from "../../../mocks/mock-data/store";
import { App } from "@/components/app";


let backend: MockBackend;

beforeEach(() => {
    backend = new MockBackend();
    backend.setup();
});


describe("Login", () => {
    it("renders login form", () => {
        renderWithProviders(<App />, {
            initialEntries: ["/login"],
            preloadedState: preloadedNullUserState(),
        });

        expect(
            screen.getByRole("heading", { name: "Login" }),
        ).toBeInTheDocument();
        expect(screen.getByLabelText("Username")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    describe("Validation", () => {
        it("displays field-level errors for empty fields", async () => {
            const { container } = renderWithProviders(<App />, {
                initialEntries: ["/login"],
                preloadedState: preloadedNullUserState(),
            });

            const form = container.querySelector("form")!;
            fireEvent.submit(form);

            await waitFor(() => {
                expect(
                    screen.getByText("Username is required."),
                ).toBeInTheDocument();
            });
            expect(
                screen.getByText("Password is required."),
            ).toBeInTheDocument();
        });

        it("displays message from fetch error when validation passes", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/login"],
                preloadedState: preloadedNullUserState(),
            });

            const usernameInput = screen.getByLabelText("Username");
            const passwordInput = screen.getByLabelText("Password");
            const submitButton = screen.getByRole("button", { name: "Login" });

            await fireEvent.change(usernameInput, {
                target: { value: "wrong" },
            });
            await fireEvent.change(passwordInput, {
                target: { value: "wrong" },
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText("Invalid credentials."),
                ).toBeInTheDocument();
            });
        });
    });

    describe("Successful login", () => {
        it("redirects to home when no redirect param is provided", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/login"],
                preloadedState: preloadedNullUserState(),
            });

            const usernameInput = screen.getByLabelText("Username");
            const passwordInput = screen.getByLabelText("Password");
            const submitButton = screen.getByRole("button", { name: "Login" });

            await fireEvent.change(usernameInput, {
                target: { value: "admin" },
            });
            await fireEvent.change(passwordInput, {
                target: { value: "admin" },
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByRole("heading", {
                        name: "Dashboard Visualizations",
                    }),
                ).toBeInTheDocument();
            });
        });

        it("redirects to the path specified in the redirect param", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/login?redirect=/admin/users"],
                preloadedState: preloadedNullUserState(),
            });

            const usernameInput = screen.getByLabelText("Username");
            const passwordInput = screen.getByLabelText("Password");
            const submitButton = screen.getByRole("button", { name: "Login" });

            await fireEvent.change(usernameInput, {
                target: { value: "admin" },
            });
            await fireEvent.change(passwordInput, {
                target: { value: "admin" },
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByRole("heading", { name: "Admin: Users" }),
                ).toBeInTheDocument();
            });
        });

        it("falls back to home when redirect param is an external URL", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/login?redirect=https://evil.com"],
                preloadedState: preloadedNullUserState(),
            });

            const usernameInput = screen.getByLabelText("Username");
            const passwordInput = screen.getByLabelText("Password");
            const submitButton = screen.getByRole("button", { name: "Login" });

            await fireEvent.change(usernameInput, {
                target: { value: "admin" },
            });
            await fireEvent.change(passwordInput, {
                target: { value: "admin" },
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByRole("heading", {
                        name: "Dashboard Visualizations",
                    }),
                ).toBeInTheDocument();
            });
        });
    });

    describe("Errors", () => {
        it("displays 'Failed to log in.' on network error during submit", async () => {
            backend.dispatcher.addHandlerOverride(
                "/api/auth/login",
                "POST",
                async () => Response.error(),
            );

            renderWithProviders(<App />, {
                initialEntries: ["/login"],
                preloadedState: preloadedNullUserState(),
            });

            const usernameInput = screen.getByLabelText("Username");
            const passwordInput = screen.getByLabelText("Password");
            const submitButton = screen.getByRole("button", { name: "Login" });

            await fireEvent.change(usernameInput, {
                target: { value: "admin" },
            });
            await fireEvent.change(passwordInput, {
                target: { value: "admin" },
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to log in."),
                ).toBeInTheDocument();
            });
        });

        it("displays 'Failed to log in.' on 500 during submit", async () => {
            backend.dispatcher.addHandlerOverride(
                "/api/auth/login",
                "POST",
                async () =>
                    new Response(
                        JSON.stringify({ detail: "Internal server error" }),
                        {
                            status: 500,
                            headers: {
                                "Content-Type": "application/json",
                            },
                        },
                    ),
            );

            renderWithProviders(<App />, {
                initialEntries: ["/login"],
                preloadedState: preloadedNullUserState(),
            });

            const usernameInput = screen.getByLabelText("Username");
            const passwordInput = screen.getByLabelText("Password");
            const submitButton = screen.getByRole("button", { name: "Login" });

            await fireEvent.change(usernameInput, {
                target: { value: "admin" },
            });
            await fireEvent.change(passwordInput, {
                target: { value: "admin" },
            });
            fireEvent.click(submitButton);

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to log in."),
                ).toBeInTheDocument();
            });
        });
    });
});
