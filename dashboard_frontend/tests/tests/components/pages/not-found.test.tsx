import { describe, it, expect, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test-utils";
import { MockBackend } from "../../../mocks/backend/mock-backend";
import { App } from "@/components/app";


describe("NotFound", () => {
    let backend: MockBackend;

    beforeEach(() => {
        backend = new MockBackend();
        backend.setup();
    });

    it("renders at a non-existing path through catch-all route", () => {
        renderWithProviders(<App />, { initialEntries: ["/nonexistent"] });
        expect(screen.getByText("Page not found.")).toBeInTheDocument();
    });

    it("renders at the explicit /not-found path", () => {
        renderWithProviders(<App />, { initialEntries: ["/not-found"] });
        expect(screen.getByText("Page not found.")).toBeInTheDocument();
    });
});
