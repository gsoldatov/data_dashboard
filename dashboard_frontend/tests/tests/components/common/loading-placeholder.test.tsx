import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoadingPlaceholder } from "@/components/common/loading-placeholder";


describe("LoadingPlaceholder", () => {
    it("renders a status element labelled 'Loading...'", () => {
        render(<LoadingPlaceholder />);
        expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders a visible spinner icon", () => {
        const { container } = render(<LoadingPlaceholder />);
        const svg = container.querySelector("svg");
        expect(svg).toBeInTheDocument();
        expect(svg!.classList.contains("animate-spin")).toBe(true);
    });
});
