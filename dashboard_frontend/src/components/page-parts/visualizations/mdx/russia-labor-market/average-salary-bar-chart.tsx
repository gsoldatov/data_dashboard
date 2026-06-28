import { useGetVisualizationDataQuery } from "@/store/backend-api-slices/visualization-data";
import {
    BarChart,
    Bar,
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
    Y_AXIS_LABEL_OFFSET,
    CHART_COLORS,
    numericTickFormatter,
    formatValue,
} from "@/styles/charts";

import type { RussiaLaborMarketAverageSalaryItem } from "@/types/visualization-data/russia-labor-market";

/** Bar chart showing average yearly salary in RUB. */
export const AverageSalaryBarChart = () => {
    const { data } = useGetVisualizationDataQuery("russia_labor_market");
    const items = (data?.[0] ?? []) as RussiaLaborMarketAverageSalaryItem[];

    const chartData = [...items].sort((a, b) => a.year - b.year);

    if (chartData.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    return (
        <div className="mb-4">
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={chartData} margin={CHART_MARGINS}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_STROKE_DASHARRAY} />
                    <XAxis dataKey="year" />
                    <YAxis
                        tickFormatter={numericTickFormatter}
                        label={{
                            value: "RUB",
                            angle: -90,
                            position: "insideLeft",
                            offset: Y_AXIS_LABEL_OFFSET,
                        }}
                    />
                    <Tooltip content={axisTooltipContent("year", "Year")} formatter={(v: number) => formatValue(v, "RUB")} />
                    <Bar dataKey="value" fill={CHART_COLORS[0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
