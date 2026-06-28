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
import { ChartPlaceholder } from "@/components/common/visualizations/charts/chart-placeholder";
import { ChartTitle } from "@/components/common/visualizations/charts/chart-title";
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

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";
import type { HierarchyItem } from "@/components/common/visualizations/selectors/hierarchy/util";

interface CategoryLineChartProps {
    items: RussiaStateBudgetItem[];
    displayedYears: number[];
    displayedCategories: HierarchyItem[];
    title: string;
}

/** Line chart with one line per displayed category over the displayed years. */
export const CategoryLineChart = ({
    items,
    displayedYears,
    displayedCategories,
    title,
}: CategoryLineChartProps) => {
    if (displayedYears.length === 0 || displayedCategories.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    // One data point per year; each displayed category becomes a property
    const chartData = displayedYears.map((year) => {
        const row: Record<string, number | string> = { year };
        for (const cat of displayedCategories) {
            const item = items.find(
                (d) => d.year === year && d.number === cat.number,
            );
            row[cat.number] = item?.value ?? 0;
        }
        return row;
    });

    return (
        <div>
            <ChartTitle>{title}</ChartTitle>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <LineChart data={chartData} margin={CHART_MARGINS}>
                    <CartesianGrid stroke={GRID_STROKE} strokeDasharray={GRID_STROKE_DASHARRAY} />
                    <XAxis dataKey="year" />
                    <YAxis
                        tickFormatter={numericTickFormatter}
                        label={{
                            value: "bln RUB",
                            angle: -90,
                            position: "insideLeft",
                            offset: Y_AXIS_LABEL_OFFSET,
                        }}
                    />
                    <Tooltip content={axisTooltipContent("year", "Year")} formatter={(v: number) => formatValue(v, "bln RUB")} />
                    <Legend
                        height={50}
                        wrapperStyle={{
                            overflowY: "auto",
                            maxHeight: 200,
                            width: "100%",
                        }}
                    />
                    {displayedCategories.map((cat, i) => (
                        <Line
                            key={cat.number}
                            type="monotone"
                            dataKey={cat.number}
                            name={shortName(cat, displayedCategories)}
                            stroke={CHART_COLORS[i % CHART_COLORS.length]}
                            dot={false}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

/** Shorten a category name when it shares a common prefix with siblings. */
const shortName = (
    cat: HierarchyItem,
    siblings: HierarchyItem[],
): string => {
    if (siblings.length <= 1) return cat.name;
    const parts = cat.name.split(" ");
    const firstWord = parts[0];
    const siblingHasSameFirstWord = siblings.some(
        (s) => s.number !== cat.number && s.name.startsWith(firstWord),
    );
    return siblingHasSameFirstWord ? cat.name : firstWord;
};
