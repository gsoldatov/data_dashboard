import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { MockBackend } from "../../../mocks/backend/mock-backend";
import {
    addNetworkErrorOverride,
    add500Override,
} from "../../../mocks/backend/route-handlers/overrides";
import { preloadedNullUserState } from "../../../mocks/mock-data/store";
import { App } from "@/components/app";


let backend: MockBackend;

beforeEach(() => {
    backend = new MockBackend();
    backend.setup();
});

/** Fill the login form fields and click the submit button. */
async function fillAndSubmitLoginForm(
    username = "admin",
    password = "admin",
): Promise<void> {
    await fireEvent.change(screen.getByLabelText("Username"), {
        target: { value: username },
    });
    await fireEvent.change(screen.getByLabelText("Password"), {
        target: { value: password },
    });
    fireEvent.click(screen.getByRole("button", { name: "Login" }));
}

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

            await fillAndSubmitLoginForm("wrong", "wrong");

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

            await fillAndSubmitLoginForm();

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
                initialEntries: ["/login?redirect=/admin/etl"],
                preloadedState: preloadedNullUserState(),
            });

            await fillAndSubmitLoginForm();

            await waitFor(() => {
                expect(
                    screen.getByRole("link", { name: "ETL" }),
                ).toBeInTheDocument();
            });
        });

        it("falls back to home when redirect param is an external URL", async () => {
            renderWithProviders(<App />, {
                initialEntries: ["/login?redirect=https://evil.com"],
                preloadedState: preloadedNullUserState(),
            });

            await fillAndSubmitLoginForm();

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
            addNetworkErrorOverride(
                backend.dispatcher,
                "/api/auth/login",
                "POST",
            );

            renderWithProviders(<App />, {
                initialEntries: ["/login"],
                preloadedState: preloadedNullUserState(),
            });

            await fillAndSubmitLoginForm();

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to log in."),
                ).toBeInTheDocument();
            });
        });

        it("displays 'Failed to log in.' on 500 during submit", async () => {
            add500Override(
                backend.dispatcher,
                "/api/auth/login",
                "POST",
                { detail: "Internal server error" },
            );

            renderWithProviders(<App />, {
                initialEntries: ["/login"],
                preloadedState: preloadedNullUserState(),
            });

            await fillAndSubmitLoginForm();

            await waitFor(() => {
                expect(
                    screen.getByText("Failed to log in."),
                ).toBeInTheDocument();
            });
        });
    });
});
