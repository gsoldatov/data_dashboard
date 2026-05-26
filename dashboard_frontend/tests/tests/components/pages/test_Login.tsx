import { describe, it, expect } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import type { RootState } from "@/store";
import { Login } from "@/components/pages/Login";

const authenticatedState: Partial<RootState> = {
  auth: {
    user: { id: 1, username: "admin", role: "admin", created_at: "2025-01-01T00:00:00Z" },
    status: "idle",
  },
};

describe("Login", () => {
  it("renders login form when not authenticated", () => {
    renderWithProviders(<Login />);
    expect(screen.getByRole("heading", { name: "Login" })).toBeInTheDocument();
    expect(screen.getByLabelText("Username")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
  });

  it("redirects to home when already authenticated", async () => {
    renderWithProviders(<Login />, { preloadedState: authenticatedState });
    // Should redirect away from login (Feed is rendered at "/")
    await waitFor(() => {
      expect(screen.queryByLabelText("Username")).not.toBeInTheDocument();
    });
  });
});
