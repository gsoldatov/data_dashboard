import { useMemo } from "react";
import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
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
import { ChartPlaceholder, axisTooltipContent } from "@/components/common/visualizations/charts/charts";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    GRID_STROKE_DASHARRAY,
    GRID_STROKE,
    Y_AXIS_LABEL_OFFSET,
    CHART_COLORS,
    formatValue,
} from "@/styles/charts";

import type { TradeYearlyTotalItem } from "@/types/visualization-data/russia-trade";

const BLN = 1_000_000_000;

/** Combined line chart showing total exports and imports by year. */
export const TradeLineChart = () => {
    const { data: exportsYearlyData } = useGetVisualizationDatasetQuery(
        "russia_trade_exports_yearly_totals",
    );
    const { data: importsYearlyData } = useGetVisualizationDatasetQuery(
        "russia_trade_imports_yearly_totals",
    );
    const exportsYearly = (exportsYearlyData ?? []) as TradeYearlyTotalItem[];
    const importsYearly = (importsYearlyData ?? []) as TradeYearlyTotalItem[];

    const chartData = useMemo(() => {
        const exportsByYear = new Map<number, number>();
        for (const item of exportsYearly) {
            exportsByYear.set(item.year, item.value / BLN);
        }
        const importsByYear = new Map<number, number>();
        for (const item of importsYearly) {
            importsByYear.set(item.year, item.value / BLN);
        }

        const years = new Set([
            ...exportsByYear.keys(),
            ...importsByYear.keys(),
        ]);
        return [...years]
            .sort((a, b) => a - b)
            .map((year) => ({
                year,
                exports: exportsByYear.get(year) ?? 0,
                imports: importsByYear.get(year) ?? 0,
            }));
    }, [exportsYearly, importsYearly]);

    if (chartData.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    return (
        <>
            <h2 className="font-bold text-2xl">Total Exports &amp; Imports by Year</h2>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={chartData} margin={CHART_MARGINS}>
                    <CartesianGrid
                        stroke={GRID_STROKE}
                        strokeDasharray={GRID_STROKE_DASHARRAY}
                    />
                    <XAxis dataKey="year" />
                    <YAxis
                        tickFormatter={(v: number) => v.toFixed(0)}
                        label={{
                            value: "bln USD",
                            angle: -90,
                            position: "insideLeft",
                            offset: Y_AXIS_LABEL_OFFSET,
                        }}
                    />
                    <Tooltip
                        content={axisTooltipContent("year", "Year")}
                        formatter={(v: number) => formatValue(v, "bln USD")}
                        cursor={{ stroke: 'var(--chart-hover)' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="exports"
                        name="Exports"
                        stroke={CHART_COLORS[0]}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="imports"
                        name="Imports"
                        stroke={CHART_COLORS[1]}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
};
