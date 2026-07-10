import { useMemo } from "react";
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
import { ChartPlaceholder } from "@/components/common/visualizations/charts/charts";
import { axisTooltipContent } from "@/components/common/visualizations/charts/chart-tooltip";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    GRID_STROKE_DASHARRAY,
    GRID_STROKE,
    CHART_COLORS,
    CHART_BRUSH_HEIGHT,
} from "@/styles/charts";

import type { RussiaCpiItem } from "@/types/visualization-data/russia-inflation";

const BRUSH_VISIBLE = 25;

export interface CumulativeInflationBarChartProps {
    startPeriod: string;
    endPeriod: string;
}

/** Bar chart showing cumulative inflation over a selected period range,
 *  computed from consumer price index data. */
export const CumulativeInflationBarChart = ({
    startPeriod,
    endPeriod,
}: CumulativeInflationBarChartProps) => {
    const { data } = useGetVisualizationDatasetQuery("russia_consumer_price_index");
    const items = (data ?? []) as RussiaCpiItem[];

    const sorted = useMemo(
        () => [...items].sort((a, b) => a.year_month.localeCompare(b.year_month)),
        [items],
    );

    const chartData = useMemo(() => {
        const filtered = sorted.filter(
            (item) =>
                item.year_month >= startPeriod && item.year_month <= endPeriod,
        );

        let cumulativeCpi = 0;
        return filtered.map((item, i) => {
            const ratio = item.value / 100;
            if (i === 0) {
                cumulativeCpi = ratio;
            } else {
                cumulativeCpi = cumulativeCpi * ratio;
            }
            return {
                year_month: item.year_month,
                cumulative_inflation: (cumulativeCpi - 1) * 100,
            };
        });
    }, [sorted, startPeriod, endPeriod]);

    if (chartData.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    const showBrush = chartData.length > BRUSH_VISIBLE;

    return (
        <div>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={chartData} margin={CHART_MARGINS}>
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
                        tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                    />
                    <Tooltip
                        content={axisTooltipContent("year_month", "Month")}
                        formatter={(v: number) =>
                            `${v.toFixed(2)}%`
                        }
                    />
                    <Bar
                        dataKey="cumulative_inflation"
                        fill={CHART_COLORS[0]}
                        name="Cumulative inflation"
                    />
                    {showBrush && (
                        <Brush
                            key={`${startPeriod}-${endPeriod}`}
                            dataKey="year_month"
                            startIndex={Math.max(
                                0,
                                chartData.length - BRUSH_VISIBLE,
                            )}
                            height={CHART_BRUSH_HEIGHT}
                            stroke="var(--chart-brush-stroke)"
                            fill="var(--chart-brush-fill)"
                        />
                    )}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
