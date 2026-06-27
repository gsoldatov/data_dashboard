import { Treemap, Tooltip, ResponsiveContainer } from "recharts";

import { ChartPlaceholder } from "@/components/common/visualizations/charts/chart-placeholder";
import { ChartTitle } from "@/components/common/visualizations/charts/chart-title";
import { ChartTooltip } from "@/components/common/visualizations/charts/chart-tooltip";
import {
    CHART_HEIGHT,
    CHART_COLORS,
    tooltipFormatter,
} from "@/components/page-parts/visualizations/util";

import type { RussiaStateBudgetItem } from "@/types/visualization-data/russia-state-budget";
import type { TreemapNode } from "recharts/types/util/types";
import type { CategoryInfo } from "../selectors/category-hierarchy";

/** Node props Recharts passes to the Treemap content component. */
interface TreemapContentProps extends TreemapNode {
    _share: number;
}

interface CategoryTreemapProps {
    items: RussiaStateBudgetItem[];
    displayedYears: number[];
    displayedCategories: CategoryInfo[];
    rootPrefix: string;
    title: string;
    onToggleCategory: (code: string) => void;
}

/** Flat treemap — one rectangle per displayed category sized by absolute value.
 *  Clicking a section selects that category via the parent callback.
 *  Tooltip shows absolute value and % share of the yearly root total. */
export const CategoryTreemap = ({
    items,
    displayedYears,
    displayedCategories,
    rootPrefix,
    title,
    onToggleCategory,
}: CategoryTreemapProps) => {
    if (displayedYears.length !== 1 || displayedCategories.length === 0) {
        return (
            <div>
                <ChartTitle>{title}</ChartTitle>
                <ChartPlaceholder
                    height={CHART_HEIGHT}
                    message="Select a single year to view the treemap"
                />
            </div>
        );
    }

    const year = displayedYears[0];
    const rootTotal =
        items.find((d) => d.year === year && d.number === rootPrefix)?.value ??
        1;

    const data = displayedCategories.map((cat) => {
        const item = items.find(
            (d) => d.year === year && d.number === cat.code,
        );
        const abs = item?.value ?? 0;
        const share = rootTotal > 0 ? (abs / rootTotal) * 100 : 0;
        return {
            name: shortName(cat, displayedCategories),
            code: cat.code,
            value: abs,
            _share: share,
        };
    });

    return (
        <div>
            <ChartTitle>{title}</ChartTitle>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <Treemap
                    data={data}
                    nameKey="name"
                    dataKey="value"
                    type="flat"
                    colorPanel={CHART_COLORS as unknown as []}
                    content={
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        <TreemapCell _share={0} {...({} as any)} />
                    }
                    onClick={(node) => {
                        const code = data[node.index]?.code;
                        if (code) onToggleCategory(code);
                    }}
                >
                    <Tooltip
                        content={ChartTooltip}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={treemapTooltip as any}
                    />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
};

/** Custom cell: coloured rectangle from CHART_COLORS plus
 *  category name and absolute value + % share text overlay.
 *  Hides text when the rectangle is too small. */
const TreemapCell = (props: TreemapContentProps) => {
    const { x, y, width, height, name, value, _share, index } = props;
    const fill = CHART_COLORS[index % CHART_COLORS.length];
    const share = _share ?? 0;

    if (width < 40 || height < 30) {
        return <rect x={x} y={y} width={width} height={height} fill={fill} />;
    }

    const cx = x + width / 2;
    const cy = y + height / 2;
    return (
        <g>
            <rect x={x} y={y} width={width} height={height} fill={fill} />
            <text
                x={cx}
                y={cy - 8}
                textAnchor="middle"
                fill="#fff"
                fontSize={12}
                fontWeight={500}
                style={{ pointerEvents: "none" }}
            >
                {name}
            </text>
            <text
                x={cx}
                y={cy + 10}
                textAnchor="middle"
                fill="#fff"
                fontSize={11}
                style={{ pointerEvents: "none" }}
            >
                {tooltipFormatter(value)} ({share.toFixed(1)}%)
            </text>
        </g>
    );
};

/** Tooltip showing absolute value + % share, labelled by the category name. */
const treemapTooltip = (
    v: number,
    name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any,
): [string, string] => {
    const share = (props.payload?._share as number) ?? 0;
    return [`${tooltipFormatter(v)}  (${share.toFixed(1)}%)`, name];
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
