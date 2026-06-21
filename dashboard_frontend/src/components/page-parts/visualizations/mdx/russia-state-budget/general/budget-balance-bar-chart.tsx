import { useGetVisualizationDataQuery } from "@/store/backend-api-slices/visualization-data";
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
import { NoDataPlaceholder } from "@/components/page-parts/visualizations/common/no-data-placeholder";
import { ChartTitle } from "@/components/page-parts/visualizations/common/chart-title";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    Y_AXIS_LABEL_OFFSET,
    POSITIVE_COLOR,
    NEGATIVE_COLOR,
    tooltipFormatter,
} from "@/components/page-parts/visualizations/util";

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";

/** Bar chart showing yearly budget profit / deficit (section "3"). */
export const BudgetBalanceBarChart = () => {
    const { data } = useGetVisualizationDataQuery("russia_state_budget");
    const items: RussiaStateBudgetItem[] = data?.[0] ?? [];

    const balanceItems = items
        .filter((d) => d.number === "3")
        .sort((a, b) => a.year - b.year);

    if (balanceItems.length === 0) {
        return <NoDataPlaceholder height={CHART_HEIGHT} />;
    }

    const chartData = balanceItems.map((d) => ({
        year: d.year,
        balance: d.value,
    }));

    return (
        <div>
            <ChartTitle>Budget Balance</ChartTitle>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={chartData} margin={CHART_MARGINS}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis
                        label={{
                            value: "bln RUB",
                            angle: -90,
                            position: "insideLeft",
                            offset: Y_AXIS_LABEL_OFFSET,
                        }}
                    />
                    <Tooltip formatter={tooltipFormatter} />
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
