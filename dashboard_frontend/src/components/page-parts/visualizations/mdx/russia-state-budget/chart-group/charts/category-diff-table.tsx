import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/common/shadcn-ui/table";
import { ChartPlaceholder } from "@/components/common/visualizations/charts/chart-placeholder";
import { ChartTitle } from "@/components/common/visualizations/charts/chart-title";
import {
    CHART_HEIGHT,
    POSITIVE_COLOR,
    NEGATIVE_COLOR,
} from "@/styles/charts";

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";
import type { HierarchyItem } from "@/components/common/visualizations/selectors/hierarchy/util";

/** Format a number with one decimal place, e.g. 1234.5 → "1234.5". */
const fmt = (v: number) => v.toFixed(1);

interface CategoryDiffTableProps {
    items: RussiaStateBudgetItem[];
    displayedYears: number[];
    displayedCategories: HierarchyItem[];
    rootPrefix: string;
    allYears: number[];
    title: string;
}

/** Table comparing each displayed category's value against the previous year.
 *  Only rendered when exactly one year is selected.
 *  First year: previous column shows dashes, no colour coding. */
export const CategoryDiffTable = ({
    items,
    displayedYears,
    displayedCategories,
    rootPrefix,
    allYears,
    title,
}: CategoryDiffTableProps) => {
    if (displayedYears.length !== 1 || displayedCategories.length === 0) {
        return (
            <div>
                <ChartTitle>{title}</ChartTitle>
                <ChartPlaceholder
                    height={CHART_HEIGHT}
                    message="Select a single year to view the table"
                />
            </div>
        );
    }

    const year = displayedYears[0];
    const firstYear = allYears.length > 0 ? Math.min(...allYears) : year;
    const isFirstYear = year === firstYear;
    const prevYear = year - 1;
    const hasPrevData = items.some(
        (d) => d.year === prevYear && d.number.startsWith(rootPrefix),
    );

    const rows = displayedCategories.map((cat) => {
        const curr = items.find(
            (d) => d.year === year && d.number === cat.number,
        );
        const prev = items.find(
            (d) => d.year === prevYear && d.number === cat.number,
        );
        const currAbs = curr?.value ?? 0;
        const prevAbs = prev?.value ?? 0;
        const diff = currAbs - prevAbs;
        const pctChange =
            prevAbs !== 0 ? (diff / prevAbs) * 100 : 0;
        return { cat, currAbs, prevAbs, diff, pctChange };
    });

    const showChange = !isFirstYear && hasPrevData;

    return (
        <div>
            <ChartTitle>{title}</ChartTitle>
            <div
                className="overflow-y-auto border rounded-md"
                style={{ maxHeight: CHART_HEIGHT }}
            >
                <Table className="table-fixed">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-1/2 font-bold" aria-label="Category" />
                            <TableHead className="w-1/4 font-bold">{prevYear}</TableHead>
                            <TableHead className="w-1/4 font-bold">{year}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((r) => (
                            <TableRow key={r.cat.number}>
                                <TableCell className="w-1/2 truncate whitespace-nowrap">
                                    {r.cat.name}
                                </TableCell>
                                <TableCell className="w-1/4 truncate whitespace-nowrap">
                                    {isFirstYear || !hasPrevData
                                        ? "—"
                                        : fmt(r.prevAbs)}
                                </TableCell>
                                <ChangeCell
                                    abs={r.currAbs}
                                    pctChange={r.pctChange}
                                    showChange={showChange}
                                />
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

/** Current-year cell: absolute value, plus a coloured percentage when applicable. */
const ChangeCell = ({
    abs,
    pctChange,
    showChange,
}: {
    abs: number;
    pctChange: number;
    showChange: boolean;
}) => {
    const sign = pctChange >= 0 ? "+" : "";
    const color = pctChange >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;

    return (
        <TableCell className="w-1/4 truncate whitespace-nowrap">
            <span style={showChange ? { color } : undefined}>
                {fmt(abs)}
            </span>
            {showChange && (
                <span style={{ color, marginLeft: 8 }}>
                    ({sign}
                    {pctChange.toFixed(1)}%)
                </span>
            )}
        </TableCell>
    );
};
