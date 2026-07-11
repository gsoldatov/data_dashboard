import { BarChart3, LayoutDashboard } from "lucide-react";

import type { VisualizationInfo } from "@/types/visualization-settings";

/** Number of DAGs displayed per page on the admin ETL page. */
export const ADMIN_ETL_DAG_PAGE_SIZE = 10;

/** Visualizations known to the application. */
export const VISUALIZATIONS: VisualizationInfo[] = [
    { slug: "russia_economy", title: "Russia Economy Dashboard", icon: LayoutDashboard },
    { slug: "russia_gdp", title: "Russia GDP", icon: BarChart3 },
    { slug: "russia_inflation", title: "Russia Inflation", icon: BarChart3 },
    { slug: "russia_labor_market", title: "Russia Labor Market", icon: BarChart3 },
    { slug: "russia_trade", title: "Russia Trade", icon: BarChart3 },
    { slug: "russia_state_budget", title: "Russia State Budget", icon: BarChart3 },
];
