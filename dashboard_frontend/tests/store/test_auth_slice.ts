import { describe, it, expect } from "vitest";
import authReducer, {
  setUser,
  clearUser,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
} from "@/store/slices/auth";
import type { UserResponse } from "@/types";

const mockUser: UserResponse = {
  id: 1,
  username: "admin",
  role: "admin",
  created_at: "2025-01-01T00:00:00Z",
};

describe("auth slice", () => {
  it("should return initial state", () => {
    const state = authReducer(undefined, { type: "unknown" });
    expect(state.user).toBeNull();
    expect(state.status).toBe("idle");
  });

  it("should handle setUser", () => {
    const state = authReducer(undefined, setUser(mockUser));
    expect(state.user).toEqual(mockUser);
  });

  it("should handle clearUser", () => {
    const state = authReducer(
      { user: mockUser, status: "idle" },
      clearUser(),
    );
    expect(state.user).toBeNull();
  });

  it("selectCurrentUser returns the user", () => {
    const state = { auth: { user: mockUser, status: "idle" as const } };
    expect(selectCurrentUser(state)).toEqual(mockUser);
  });

  it("selectIsAuthenticated returns false when no user", () => {
    const state = { auth: { user: null, status: "idle" as const } };
    expect(selectIsAuthenticated(state)).toBe(false);
  });

  it("selectIsAdmin returns true for admin user", () => {
    const state = { auth: { user: mockUser, status: "idle" as const } };
    expect(selectIsAdmin(state)).toBe(true);
  });

  it("selectIsAdmin returns false for viewer", () => {
    const viewer = { ...mockUser, role: "viewer" as const };
    const state = { auth: { user: viewer, status: "idle" as const } };
    expect(selectIsAdmin(state)).toBe(false);
  });
});
