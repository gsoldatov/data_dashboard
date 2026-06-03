import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Error } from "@/components/common/messages";


describe("Error", () => {
    it("renders the message text", () => {
        render(<Error message="Something went wrong." />);
        expect(screen.getByText("Something went wrong.")).toBeInTheDocument();
    });

    it("does not render a header when header prop is omitted", () => {
        const { container } = render(<Error message="Oops." />);
        const headings = container.querySelectorAll("h3");
        expect(headings).toHaveLength(0);
    });

    it("renders the header as a card title when provided", () => {
        render(<Error header="Not Found" message="The page was not found." />);
        expect(screen.getByText("Not Found")).toBeInTheDocument();
        expect(screen.getByText("The page was not found.")).toBeInTheDocument();
    });

    it("renders with destructive styling", () => {
        const { container } = render(<Error message="Error occurred." />);
        const card = container.firstElementChild;
        expect(card?.classList.contains("border-destructive")).toBe(true);
    });
});
