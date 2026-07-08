import {
    VisualizationPageNavigation,
    VisualizationPageNavigationItem,
} from "@/components/common/visualizations/navigation";

/** Navigation across all Russia Economy visualization pages. */
export const RussiaEconomyNavigation = () => (
    <VisualizationPageNavigation>
        <VisualizationPageNavigationItem
            link="/visualizations/russia_economy"
            linkText="Economy Dashboard"
        />
        <VisualizationPageNavigationItem
            link="/visualizations/russia_gdp"
            linkText="GDP"
        />
        <VisualizationPageNavigationItem
            link="/visualizations/russia_inflation"
            linkText="Inflation"
        />
        <VisualizationPageNavigationItem
            link="/visualizations/russia_labor_market"
            linkText="Labor Market"
        />
        <VisualizationPageNavigationItem
            link="/visualizations/russia_trade"
            linkText="Trade"
        />
        <VisualizationPageNavigationItem
            link="/visualizations/russia_state_budget"
            linkText="State Budget"
        />
    </VisualizationPageNavigation>
);
