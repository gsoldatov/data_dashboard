import { useGetVisualizationDataQuery } from "@/store/backend-api-slices/visualization-data";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
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
    formatValue,
} from "@/styles/charts";

import type { RussiaGdpItem } from "@/types/visualization-data/russia-gdp";

interface GdpLineChartProps {
    datasetIndex: number;
    title: string;
    color: string;
    valueDivisor: number;
    unit: string;
}

/** Line chart for a single Russia GDP dataset. */
export const GdpLineChart = ({
    datasetIndex,
    title,
    color,
    valueDivisor,
    unit,
}: GdpLineChartProps) => {
    const { data } = useGetVisualizationDataQuery("russia_gdp");
    const items = (data?.[datasetIndex] ?? []) as RussiaGdpItem[];

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
        <div className="mb-4">
            <ChartTitle>{title}</ChartTitle>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={chartData} margin={CHART_MARGINS}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_STROKE_DASHARRAY} />
                    <XAxis dataKey="year" />
                    <YAxis
                        domain={["auto", "auto"]}
                        tickFormatter={(value: number) => value.toLocaleString()}
                    />
                    <Tooltip content={axisTooltipContent("year", "Year")} formatter={(v: number) => formatValue(v, unit)} />
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
