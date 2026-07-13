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
import { ChartPlaceholder, ChartTitle, axisTooltipContent } from "@/components/common/visualizations/charts/charts";
import { FLOW_SPACING } from "@/styles/constants";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    GRID_STROKE_DASHARRAY,
    GRID_STROKE,
    AXIS_STROKE,
    CHART_COLORS,
    CHART_BRUSH_HEIGHT,
} from "@/styles/charts";

import type { RussiaLaborMarketWorkforceItem } from "@/types/visualization-data/russia-labor-market";

const BRUSH_VISIBLE = 25;

/** Line chart showing workforce unemployment percentage over time, monthly, with a brush slider. */
export const WorkforceUnemploymentLineChart = () => {
    const { data } = useGetVisualizationDatasetQuery("russia_labor_workforce");
    const items = (data ?? []) as RussiaLaborMarketWorkforceItem[];

    const chartData = [...items].sort((a, b) =>
        a.year_month.localeCompare(b.year_month),
    );

    if (chartData.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    return (
        <div className={FLOW_SPACING}>
            <ChartTitle>Workforce Unemployment, %</ChartTitle>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={chartData} margin={CHART_MARGINS}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_STROKE_DASHARRAY} />
                    <XAxis dataKey="year_month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} stroke={AXIS_STROKE} />
                    <YAxis domain={["auto", "auto"]} stroke={AXIS_STROKE} />
                    <Tooltip content={axisTooltipContent("year_month", "Month")} formatter={(v: number) => `${v.toFixed(1)}%`} cursor={{ stroke: 'var(--chart-hover)' }} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="unemployed_share_in_workforce"
                        name="Unemployed share in workforce"
                        stroke={CHART_COLORS[2]}
                        dot={false}
                    />
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
