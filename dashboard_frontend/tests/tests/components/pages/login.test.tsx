import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { MockBackend } from "../../../mocks/backend/mock-backend";

import type { RootState } from "@/store";
import { App } from "@/components/app";

const userData = {
    id: 1,
    username: "admin",
    role: "admin" as const,
    created_at: "2025-01-01T00:00:00Z",
};

function preloadedUserState(): Partial<RootState> {
    return {
        api: {
            queries: {
                "getCurrentUser(undefined)": {
                    status: "fulfilled" as const,
                    data: userData,
                },
            },
        },
    } as unknown as Partial<RootState>;
}

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

function renderLogin(preloadedState: Partial<RootState>, initialEntries: string[] = ["/login"]) {
    return renderWithProviders(<App />, { initialEntries, preloadedState });
}

let backend: MockBackend;

beforeEach(() => {
    backend = new MockBackend();
    backend.setup();
});


describe("Basic load", () => {
    it("renders login form when not authenticated", () => {
        renderLogin(preloadedNullUserState());
        expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
        expect(screen.getByLabelText("Username")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("redirects to home when already authenticated", async () => {
        renderLogin(preloadedUserState());
        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: "Dashboard Visualizations" }),
            ).toBeInTheDocument();
        });
    });
});

describe("Validation", () => {
    it("displays field-level errors for empty fields", async () => {
        const { container } = renderLogin(preloadedNullUserState());

        const form = container.querySelector("form")!;
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText("Username is required.")).toBeInTheDocument();
        });
        expect(screen.getByText("Password is required.")).toBeInTheDocument();
    });

    it("displays message from fetch error when validation passes", async () => {
        renderLogin(preloadedNullUserState());

        const usernameInput = screen.getByLabelText("Username");
        const passwordInput = screen.getByLabelText("Password");
        const submitButton = screen.getByRole("button", { name: "Login" });

        await fireEvent.change(usernameInput, { target: { value: "wrong" } });
        await fireEvent.change(passwordInput, { target: { value: "wrong" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
        });
    });
});

describe("Successful login", () => {
    it("redirects to home when no redirect param is provided", async () => {
        renderLogin(preloadedNullUserState());

        const usernameInput = screen.getByLabelText("Username");
        const passwordInput = screen.getByLabelText("Password");
        const submitButton = screen.getByRole("button", { name: "Login" });

        await fireEvent.change(usernameInput, { target: { value: "admin" } });
        await fireEvent.change(passwordInput, { target: { value: "admin" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: "Dashboard Visualizations" }),
            ).toBeInTheDocument();
        });
    });

    it("redirects to the path specified in the redirect param", async () => {
        renderLogin(preloadedNullUserState(), ["/login?redirect=/profile"]);

        const usernameInput = screen.getByLabelText("Username");
        const passwordInput = screen.getByLabelText("Password");
        const submitButton = screen.getByRole("button", { name: "Login" });

        await fireEvent.change(usernameInput, { target: { value: "admin" } });
        await fireEvent.change(passwordInput, { target: { value: "admin" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: "Profile" }),
            ).toBeInTheDocument();
        });
    });

    it("falls back to home when redirect param is an external URL", async () => {
        renderLogin(preloadedNullUserState(), ["/login?redirect=https://evil.com"]);

        const usernameInput = screen.getByLabelText("Username");
        const passwordInput = screen.getByLabelText("Password");
        const submitButton = screen.getByRole("button", { name: "Login" });

        await fireEvent.change(usernameInput, { target: { value: "admin" } });
        await fireEvent.change(passwordInput, { target: { value: "admin" } });
        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(
                screen.getByRole("heading", { name: "Dashboard Visualizations" }),
            ).toBeInTheDocument();
        });
    });
});
