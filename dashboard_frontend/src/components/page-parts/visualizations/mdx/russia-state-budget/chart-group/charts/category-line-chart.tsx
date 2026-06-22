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
import { ChartPlaceholder } from "@/components/page-parts/visualizations/common/chart-placeholder";
import { ChartTitle } from "@/components/page-parts/visualizations/common/chart-title";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    Y_AXIS_LABEL_OFFSET,
    CHART_COLORS,
    tooltipFormatter,
} from "@/components/page-parts/visualizations/util";

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";
import type { CategoryInfo } from "../category-hierarchy";

interface CategoryLineChartProps {
    items: RussiaStateBudgetItem[];
    displayedYears: number[];
    displayedCategories: CategoryInfo[];
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
                (d) => d.year === year && d.number === cat.code,
            );
            row[cat.code] = item?.value ?? 0;
        }
        return row;
    });

    return (
        <div>
            <ChartTitle>{title}</ChartTitle>
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
                            key={cat.code}
                            type="monotone"
                            dataKey={cat.code}
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
    cat: CategoryInfo,
    siblings: CategoryInfo[],
): string => {
    if (siblings.length <= 1) return cat.name;
    const parts = cat.name.split(" ");
    const firstWord = parts[0];
    const siblingHasSameFirstWord = siblings.some(
        (s) => s.code !== cat.code && s.name.startsWith(firstWord),
    );
    return siblingHasSameFirstWord ? cat.name : firstWord;
};
