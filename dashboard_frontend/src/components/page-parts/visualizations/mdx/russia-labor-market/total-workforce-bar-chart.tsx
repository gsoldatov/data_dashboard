import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import {
    BarChart,
    Bar,
    Brush,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChartPlaceholder, ChartTitle, axisTooltipContent } from "@/components/common/visualizations/charts/charts";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    GRID_STROKE_DASHARRAY,
    GRID_STROKE,
    AXIS_STROKE,
    CHART_COLORS,
    numericTickFormatter,
    formatValue,
    CHART_BRUSH_HEIGHT,
} from "@/styles/charts";

import type { RussiaLaborMarketWorkforceItem } from "@/types/visualization-data/russia-labor-market";

const BRUSH_VISIBLE = 50;

/** Bar chart showing total workforce over time, monthly, with a brush slider. */
export const TotalWorkforceBarChart = () => {
    const { data } = useGetVisualizationDatasetQuery("russia_labor_workforce");
    const items = (data ?? []) as RussiaLaborMarketWorkforceItem[];

    const chartData = [...items].sort((a, b) =>
        a.year_month.localeCompare(b.year_month),
    );

    if (chartData.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    return (
        <>
            <ChartTitle>Total Workforce, thousands</ChartTitle>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={chartData} margin={CHART_MARGINS}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_STROKE_DASHARRAY} />
                    <XAxis dataKey="year_month" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} stroke={AXIS_STROKE} />
                    <YAxis domain={["auto", "auto"]} tickFormatter={numericTickFormatter} stroke={AXIS_STROKE} />
                    <Tooltip content={axisTooltipContent("year_month", "Month")} formatter={(v: number) => formatValue(v, "thousands")} cursor={false} />
                    <Bar dataKey="workforce" fill={CHART_COLORS[0]} activeBar={{ fill: 'var(--chart-hover)' }} />
                    <Brush
                        dataKey="year_month"
                        startIndex={Math.max(0, chartData.length - BRUSH_VISIBLE)}
                        height={CHART_BRUSH_HEIGHT}
                        stroke="var(--chart-brush-stroke)"
                        fill="var(--chart-brush-fill)"
                    />
                </BarChart>
            </ResponsiveContainer>
        </>
    );
};
