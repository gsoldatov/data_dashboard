import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { MockBackend } from "../../../mocks/backend/mock-backend";
import { Feed } from "@/components/pages/feed";


describe("Feed", () => {
    let backend: MockBackend;

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    // TODO update with actual test cases instead of a stub
    it("renders page heading", () => {
        renderWithProviders(<Feed />);
        expect(screen.getByText("Dashboard Visualizations")).toBeInTheDocument();
    });

    it("renders the hardcoded visualization list", () => {
        renderWithProviders(<Feed />);
        expect(screen.getByText("Russia State Budget")).toBeInTheDocument();
        expect(
            screen.getByText("/visualizations/russia_state_budget")
        ).toBeInTheDocument();
    });
});
