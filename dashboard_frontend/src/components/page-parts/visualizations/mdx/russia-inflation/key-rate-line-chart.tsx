import { useMemo } from "react";
import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import {
    LineChart,
    Line,
    Brush,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChartPlaceholder } from "@/components/common/visualizations/charts/chart-placeholder";
import { axisTooltipContent } from "@/components/common/visualizations/charts/chart-tooltip";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    GRID_STROKE_DASHARRAY,
    GRID_STROKE,
    CHART_COLORS,
    CHART_BRUSH_HEIGHT,
} from "@/styles/charts";

import type { RussiaKeyRateItem } from "@/types/visualization-data/russia-inflation";

const BRUSH_VISIBLE = 25;

/** Line chart showing the CBR key rate over time, with a brush slider. */
export const KeyRateLineChart = () => {
    const { data } = useGetVisualizationDatasetQuery("russia_key_rate");
    const items = (data ?? []) as RussiaKeyRateItem[];

    const chartData = useMemo(() => {
        const sorted = [...items].sort((a, b) =>
            a.year_month.localeCompare(b.year_month),
        );
        return sorted.filter((item) => item.key_rate != null);
    }, [items]);

    if (chartData.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    return (
        <div>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={chartData} margin={CHART_MARGINS}>
                    <CartesianGrid
                        stroke={GRID_STROKE}
                        strokeDasharray={GRID_STROKE_DASHARRAY}
                    />
                    <XAxis
                        dataKey="year_month"
                        tick={{ fontSize: 10 }}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                    />
                    <YAxis
                        domain={["auto", "auto"]}
                        tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip
                        content={axisTooltipContent("year_month", "Month")}
                        formatter={(v: number) => `${v}%`}
                    />
                    <Line
                        type="monotone"
                        dataKey="key_rate"
                        name="Key rate"
                        stroke={CHART_COLORS[1]}
                        dot={false}
                    />
                    <Brush
                        dataKey="year_month"
                        startIndex={Math.max(
                            0,
                            chartData.length - BRUSH_VISIBLE,
                        )}
                        height={CHART_BRUSH_HEIGHT}
                        stroke="var(--chart-brush-stroke)"
                        fill="var(--chart-brush-fill)"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
