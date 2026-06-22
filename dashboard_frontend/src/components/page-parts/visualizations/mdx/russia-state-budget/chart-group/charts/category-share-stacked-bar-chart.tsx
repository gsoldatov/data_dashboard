import {
    BarChart,
    Bar,
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
    CHART_COLORS,
    tooltipFormatter,
} from "@/components/page-parts/visualizations/util";

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";
import type { CategoryInfo } from "../selectors/category-hierarchy";

const STACKED_CHART_MARGINS = { ...CHART_MARGINS, top: 25, right: 25 };

interface CategoryShareStackedBarChartProps {
    items: RussiaStateBudgetItem[];
    displayedYears: number[];
    displayedCategories: CategoryInfo[];
    rootPrefix: string;
    title: string;
}

/** 100 % stacked bar chart — one bar per year, segments = category % shares.
 *  Share denominator is the root item (e.g. "1" for income), not sum of children,
 *  since subcategories overlap with their parents.
 *  Left Y-axis: % share.  Right Y-axis: absolute values (bln RUB), proportional to left. */
export const CategoryShareStackedBarChart = ({
    items,
    displayedYears,
    displayedCategories,
    rootPrefix,
    title,
}: CategoryShareStackedBarChartProps) => {
    if (displayedYears.length === 0 || displayedCategories.length === 0) {
        return <ChartPlaceholder height={CHART_HEIGHT} />;
    }

    // Absolute values per year × category
    const absoluteByYear = new Map<number, Map<string, number>>();
    // Root totals per year — denominator for % shares (not sum of children, since they overlap)
    const rootTotals = new Map<number, number>();
    for (const year of displayedYears) {
        const map = new Map<string, number>();
        for (const cat of displayedCategories) {
            const item = items.find(
                (d) => d.year === year && d.number === cat.code,
            );
            map.set(cat.code, item?.value ?? 0);
        }
        absoluteByYear.set(year, map);
        const root = items.find(
            (d) => d.year === year && d.number === rootPrefix,
        );
        rootTotals.set(year, root?.value ?? 0);
    }

    const maxTotal = Math.max(...rootTotals.values(), 1);

    // Build chart data: one row per year, each category is its % share of root total
    const chartData = displayedYears.map((year) => {
        const row: Record<string, number | string> = { year };
        const rootTotal = rootTotals.get(year) ?? 1;
        const abs = absoluteByYear.get(year)!;
        for (const cat of displayedCategories) {
            row[cat.code] = rootTotal > 0 ? (abs.get(cat.code)! / rootTotal) * 100 : 0;
        }
        row._total = maxTotal; // for right-axis sync
        return row;
    });

    return (
        <div>
            <ChartTitle>{title}</ChartTitle>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <BarChart data={chartData} margin={STACKED_CHART_MARGINS}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis
                        yAxisId="pct"
                        domain={[0, "auto"]}
                        tickFormatter={(v: number) => `${v.toFixed(0)}%`}
                    />
                    <YAxis
                        yAxisId="abs"
                        orientation="right"
                        domain={[0, maxTotal]}
                        tickFormatter={tooltipFormatter}                        
                    />
                    <Tooltip
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={makeCustomFormatter(absoluteByYear, displayedCategories) as any}
                    />
                    <Legend
                        height={50}
                        wrapperStyle={{
                            overflowY: "auto",
                            maxHeight: 200,
                            width: "100%",
                        }}
                    />
                    {displayedCategories.map((cat, i) => (
                        <Bar
                            key={cat.code}
                            yAxisId="pct"
                            dataKey={cat.code}
                            name={shortName(cat, displayedCategories)}
                            stackId="a"
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

/** Build a tooltip formatter that shows both % share and absolute value,
 *  with the category name instead of the code. */
const makeCustomFormatter = (
    absoluteByYear: Map<number, Map<string, number>>,
    categories: CategoryInfo[],
) => {
    const nameByCode = new Map(categories.map((c) => [c.code, c.name]));
    return (v: number, _name: string, props: Record<string, unknown>): [string, string] => {
        const code = String(props.dataKey ?? "");
        const payload = props.payload as Record<string, unknown> | undefined;
        const year = payload?.year as number | undefined;
        const absMap = year != null ? absoluteByYear.get(year) : undefined;
        const abs = absMap?.get(code) ?? 0;
        const displayName = nameByCode.get(code) ?? code;
        return [`${v.toFixed(1)}%  (${tooltipFormatter(abs)})`, displayName];
    };
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
