import { describe, it, expect, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { MockBackend } from "../../../mocks/backend/mock-backend";

import type { RootState } from "@/store";
import { Login } from "@/components/pages/login";
import { AnonymousRoute } from "@/components/stateful/protected-routes/anonymous-route";

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

describe("Login", () => {
    let backend: MockBackend;
    
    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });
    
    // TODO update with actual test cases instead of a stub
    it("renders login form when not authenticated", () => {
        renderWithProviders(<Login />, { preloadedState: preloadedNullUserState() });
        expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
        expect(screen.getByLabelText("Username")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
    });

    it("redirects to home when already authenticated", async () => {
        renderWithProviders(<AnonymousRoute><Login /></AnonymousRoute>, { preloadedState: preloadedUserState() });
        // Should redirect away from login (Feed is rendered at "/")
        await waitFor(() => {
            expect(screen.queryByLabelText("Username")).not.toBeInTheDocument();
        });
    });
});
