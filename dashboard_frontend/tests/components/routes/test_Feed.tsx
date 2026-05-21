import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../test-utils";
import Feed from "@/components/routes/Feed";

describe("Feed", () => {
  it("renders page heading", () => {
    renderWithProviders(<Feed />);
    expect(screen.getByText("Dashboard Pages")).toBeInTheDocument();
  });

  it("renders the hardcoded page list", () => {
    renderWithProviders(<Feed />);
    expect(screen.getByText("Russia State Budget")).toBeInTheDocument();
    expect(screen.getByText("/page/russia_state_budget")).toBeInTheDocument();
  });
});
