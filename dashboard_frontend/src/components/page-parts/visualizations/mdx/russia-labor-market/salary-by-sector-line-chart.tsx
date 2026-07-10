import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { ChartPlaceholder } from "@/components/common/visualizations/charts/charts";
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

import type { RussiaLaborMarketSectorSalaryItem } from "@/types/visualization-data/russia-labor-market";

interface SalaryBySectorLineChartProps {
    items: RussiaLaborMarketSectorSalaryItem[];
    displayedSectors: string[];
}

/** Line chart comparing average salary across sectors over years. */
export const SalaryBySectorLineChart = ({
    items,
    displayedSectors,
}: SalaryBySectorLineChartProps) => {
    const years = [...new Set(items.map((d) => d.year))].sort((a, b) => a - b);

    /** Build pivot: { year, sectorA: value, sectorB: value, ... } */
    const chartData = years.map((year) => {
        const row: Record<string, number | string> = { year };
        for (const sector of displayedSectors) {
            const item = items.find(
                (d) => d.year === year && d.sector === sector,
            );
            row[sector] = item?.value ?? 0;
        }
        return row;
    });

    if (chartData.length === 0 || displayedSectors.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    return (
        <div>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={chartData} margin={CHART_MARGINS}>
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
                    <Legend wrapperStyle={{ maxHeight: "2.8em", overflowY: "auto" }} />
                    {displayedSectors.map((sector, i) => (
                        <Line
                            key={sector}
                            type="monotone"
                            dataKey={sector}
                            name={sector}
                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
