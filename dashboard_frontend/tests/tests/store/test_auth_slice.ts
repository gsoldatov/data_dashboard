import { describe, it, expect } from "vitest";
import authReducer, { setUser, clearUser } from "@/store/slices/auth";
import type { User } from "@/types/user";

const mockUser: User = {
    id: 1,
    username: "admin",
    role: "admin",
    created_at: "2025-01-01T00:00:00Z",
};

describe("auth slice", () => {
    it("should return initial state", () => {
        const state = authReducer(undefined, { type: "unknown" });
        expect(state.user).toBeNull();
    });

    it("should handle setUser", () => {
        const state = authReducer(undefined, setUser(mockUser));
        expect(state.user).toEqual(mockUser);
    });

    it("should handle clearUser", () => {
        const state = authReducer(
            { user: mockUser },
            clearUser(),
        );
        expect(state.user).toBeNull();
    });
});
