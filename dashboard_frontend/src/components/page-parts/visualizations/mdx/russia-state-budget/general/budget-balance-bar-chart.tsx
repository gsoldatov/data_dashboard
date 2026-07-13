import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { ChartPlaceholder, ChartTitle, axisTooltipContent } from "@/components/common/visualizations/charts/charts";
import { FLOW_SPACING } from "@/styles/constants";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    GRID_STROKE_DASHARRAY,
    GRID_STROKE,
    AXIS_STROKE,
    Y_AXIS_LABEL_OFFSET,
    POSITIVE_COLOR,
    NEGATIVE_COLOR,
    numericTickFormatter,
    formatValue,
} from "@/styles/charts";

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";

/** Bar chart showing yearly budget profit / deficit (section "3"). */
export const BudgetBalanceBarChart = () => {
    const { data } = useGetVisualizationDatasetQuery("russia_state_budget");
    const items = (data ?? []) as RussiaStateBudgetItem[];

    const balanceItems = items
        .filter((d) => d.number === "3")
        .sort((a, b) => a.year - b.year);

    if (balanceItems.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    const chartData = balanceItems.map((d) => ({
        year: d.year,
        balance: d.value,
    }));

    return (
        <div className={FLOW_SPACING}>
            <ChartTitle>Budget Balance</ChartTitle>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={chartData} margin={CHART_MARGINS}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_STROKE_DASHARRAY} />
                    <XAxis dataKey="year" stroke={AXIS_STROKE} />
                    <YAxis
                        stroke={AXIS_STROKE}
                        tickFormatter={numericTickFormatter}
                        label={{
                            value: "bln RUB",
                            angle: -90,
                            position: "insideLeft",
                            offset: Y_AXIS_LABEL_OFFSET,
                        }}
                    />
                    <Tooltip content={axisTooltipContent("year", "Year")} formatter={(v: number) => formatValue(v, "bln RUB")} cursor={{ fill: 'var(--chart-hover)', fillOpacity: 0.35 }} />
                    <Legend />
                    <Bar
                        dataKey="balance"
                        name="Profit (+) / Deficit (-)"
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={index}
                                fill={
                                    entry.balance >= 0
                                        ? POSITIVE_COLOR
                                        : NEGATIVE_COLOR
                                }
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
