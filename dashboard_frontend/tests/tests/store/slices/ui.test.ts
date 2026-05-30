import { describe, it, expect } from "vitest";
import uiReducer, { setRedirectOnRender } from "@/store/slices/ui";

describe("ui slice", () => {
    it("should return initial state", () => {
        const state = uiReducer(undefined, { type: "unknown" });
        expect(state.redirectOnRender).toBe("");
    });

    it("should handle setRedirectOnRender", () => {
        const state = uiReducer(undefined, setRedirectOnRender("/login"));
        expect(state.redirectOnRender).toBe("/login");
    });

    it("should handle setRedirectOnRender with empty string to clear", () => {
        const state = uiReducer(
            { redirectOnRender: "/login" },
            setRedirectOnRender(""),
        );
        expect(state.redirectOnRender).toBe("");
    });
});
