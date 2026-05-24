import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import { Feed } from "@/components/pages/Feed";

describe("Feed", () => {
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
