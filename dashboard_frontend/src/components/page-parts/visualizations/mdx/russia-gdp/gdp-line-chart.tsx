import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import {
    LineChart,
    Line,
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
    formatValue,
} from "@/styles/charts";

import type { RussiaGdpItem } from "@/types/visualization-data/russia-gdp";

interface GdpLineChartProps {
    datasetName: string;
    title: string;
    color: string;
    valueDivisor: number;
    unit: string;
}

/** Line chart for a single Russia GDP dataset. */
export const GdpLineChart = ({
    datasetName,
    title,
    color,
    valueDivisor,
    unit,
}: GdpLineChartProps) => {
    const { data } = useGetVisualizationDatasetQuery(datasetName);
    const items = (data ?? []) as RussiaGdpItem[];

    const chartData = [...items]
        .sort((a, b) => a.year - b.year)
        .map((item) => ({
            year: item.year,
            value: item.value / valueDivisor,
        }));

    if (chartData.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    return (
        <>
            <ChartTitle>{title}</ChartTitle>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={chartData} margin={CHART_MARGINS}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_STROKE_DASHARRAY} />
                    <XAxis dataKey="year" stroke={AXIS_STROKE} />
                    <YAxis
                        domain={["auto", "auto"]}
                        tickFormatter={(value: number) => value.toLocaleString()}
                        stroke={AXIS_STROKE}
                    />
                    <Tooltip content={axisTooltipContent("year", "Year")} formatter={(v: number) => formatValue(v, unit)} cursor={{ stroke: 'var(--chart-hover)' }} />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
};
