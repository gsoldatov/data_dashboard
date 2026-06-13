import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../../test-utils";
import { AdminNavbar } from "@/components/page-parts/admin/admin-navbar";


describe("AdminNavbar", () => {
    it("renders both admin navigation links", () => {
        renderWithProviders(<AdminNavbar />);

        const etlLink = screen.getByRole("link", { name: "ETL" });
        const vizLink = screen.getByRole("link", {
            name: "Visualizations",
        });

        expect(etlLink).toHaveAttribute("href", "/admin/etl");
        expect(vizLink).toHaveAttribute("href", "/admin/visualizations");
    });

    it("highlights the active link based on the current URL", () => {
        renderWithProviders(<AdminNavbar />, {
            initialEntries: ["/admin/etl"],
        });

        const etlLink = screen.getByRole("link", { name: "ETL" });

        expect(etlLink).toHaveAttribute("data-active", "");
    });

    it("does not highlight inactive links", () => {
        renderWithProviders(<AdminNavbar />, {
            initialEntries: ["/admin/etl"],
        });

        const vizLink = screen.getByRole("link", {
            name: "Visualizations",
        });

        expect(vizLink).not.toHaveAttribute("data-active");
    });
});
