import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "../../../../../../test-utils";
import { RussiaEconomyNavigation } from "@/components/page-parts/visualizations/mdx/russia-economy/navigation";

const LINKS = [
    { link: "/visualizations/russia_economy", linkText: "Economy Dashboard" },
    { link: "/visualizations/russia_gdp", linkText: "GDP" },
    { link: "/visualizations/russia_inflation", linkText: "Inflation" },
    { link: "/visualizations/russia_labor_market", linkText: "Labor Market" },
    { link: "/visualizations/russia_trade", linkText: "Trade" },
    { link: "/visualizations/russia_state_budget", linkText: "State Budget" },
] as const;


describe("RussiaEconomyNavigation", () => {
    it("renders all navigation links with correct hrefs", () => {
        renderWithProviders(<RussiaEconomyNavigation />);

        for (const { link, linkText } of LINKS) {
            const el = screen.getByRole("link", { name: linkText });
            expect(el).toHaveAttribute("href", link);
        }
    });

    it("renders the active page as bold text instead of a link", () => {
        const active = LINKS[2]; // Russia Inflation

        renderWithProviders(<RussiaEconomyNavigation />, {
            initialEntries: [active.link],
        });

        expect(
            screen.queryByRole("link", { name: active.linkText }),
        ).toBeNull();
        expect(screen.getByText(active.linkText).tagName).toBe("SPAN");
    });

    it("renders inactive pages as links", () => {
        const active = LINKS[2]; // Russia Inflation

        renderWithProviders(<RussiaEconomyNavigation />, {
            initialEntries: [active.link],
        });

        for (const { link, linkText } of LINKS) {
            if (link === active.link) continue;
            const el = screen.getByRole("link", { name: linkText });
            expect(el).toHaveAttribute("href", link);
            expect(el.tagName).toBe("A");
        }
    });

    it("navigates to the correct URL when a link is clicked", async () => {
        const user = userEvent.setup();

        const { location } = renderWithProviders(
            <RussiaEconomyNavigation />,
            { initialEntries: ["/visualizations/russia_economy"] },
        );

        const gdpLink = screen.getByRole("link", { name: "GDP" });
        await user.click(gdpLink);

        expect(location.current?.pathname).toBe(
            "/visualizations/russia_gdp",
        );
    });
});
