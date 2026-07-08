import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import {
    LineChart,
    Line,
    Brush,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { ChartPlaceholder } from "@/components/common/visualizations/charts/chart-placeholder";
import { ChartTitle } from "@/components/common/visualizations/charts/chart-title";
import { axisTooltipContent } from "@/components/common/visualizations/charts/chart-tooltip";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    GRID_STROKE_DASHARRAY,
    GRID_STROKE,
    CHART_COLORS,
    CHART_BRUSH_HEIGHT,
} from "@/styles/charts";

import type { RussiaLaborMarketWorkforceItem } from "@/types/visualization-data/russia-labor-market";

const BRUSH_VISIBLE = 25;

const ENGAGEMENT_FIELDS = [
    { key: "workforce_share_in_population", label: "Workforce share in population", color: CHART_COLORS[0] },
    { key: "employed_share_in_population", label: "Employed share in population", color: CHART_COLORS[1] },
] as const;

/** Line chart showing workforce engagement percentages over time, monthly, with a brush slider. */
export const WorkforceEngagementLineChart = () => {
    const { data } = useGetVisualizationDatasetQuery("russia_labor_workforce");
    const items = (data ?? []) as RussiaLaborMarketWorkforceItem[];

    const chartData = [...items].sort((a, b) =>
        a.year_month.localeCompare(b.year_month),
    );

    if (chartData.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    return (
        <div>
            <ChartTitle>Workforce Engagement, %</ChartTitle>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={chartData} margin={CHART_MARGINS}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_STROKE_DASHARRAY} />
                    <XAxis dataKey="year_month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip content={axisTooltipContent("year_month", "Month")} formatter={(v: number) => `${v.toFixed(1)}%`} />
                    <Legend />
                    {ENGAGEMENT_FIELDS.map(({ key, label, color }) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            name={label}
                            stroke={color}
                            dot={false}
                        />
                    ))}
                    <Brush
                        dataKey="year_month"
                        startIndex={Math.max(0, chartData.length - BRUSH_VISIBLE)}
                        height={CHART_BRUSH_HEIGHT}
                        stroke="var(--chart-brush-stroke)"
                        fill="var(--chart-brush-fill)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
