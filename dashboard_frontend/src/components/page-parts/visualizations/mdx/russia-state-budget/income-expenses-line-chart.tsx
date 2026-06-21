import { useGetVisualizationDataQuery } from "@/store/backend-api-slices/visualization-data";
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
import { NoDataPlaceholder } from "@/components/page-parts/visualizations/no-data-placeholder";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    Y_AXIS_LABEL_OFFSET,
    CHART_COLORS,
    tooltipFormatter,
} from "../../util";

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";

/** Line chart comparing total income (section "1") and total expenses (section "2") over years. */
export const IncomeExpensesLineChart = () => {
    const { data } = useGetVisualizationDataQuery("russia_state_budget");
    const items: RussiaStateBudgetItem[] = data?.[0] ?? [];

    const incomeByYear = mapByName(items, "1");
    const expensesByYear = mapByName(items, "2");

    const years = [...new Set(items.map((d) => d.year))].sort((a, b) => a - b);
    const chartData = years.map((year) => ({
        year,
        income: incomeByYear.get(year) ?? 0,
        expenses: expensesByYear.get(year) ?? 0,
    }));

    if (chartData.length === 0) {
        return <NoDataPlaceholder height={CHART_HEIGHT} />;
    }

    return (
        <>
            <h3 className="font-bold text-xl mt-6">Income &amp; Expenses</h3>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={chartData} margin={CHART_MARGINS}>
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
                    <Line
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        stroke={CHART_COLORS[0]}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="expenses"
                        name="Expenses"
                        stroke={CHART_COLORS[1]}
                        dot={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </>
    );
};

/** Build a Map<year, value> for items matching the given section number. */
const mapByName = (
    items: RussiaStateBudgetItem[],
    number: string,
): Map<number, number> => {
    const map = new Map<number, number>();
    for (const item of items) {
        if (item.number === number) {
            map.set(item.year, item.value);
        }
    }
    return map;
};
