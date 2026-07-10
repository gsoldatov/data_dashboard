import { useMemo } from "react";
import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import {
    Treemap,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { ChartPlaceholder, ChartTitle, ChartTooltip } from "@/components/common/visualizations/charts/charts";
import {
    CHART_HEIGHT,
    CHART_COLORS,
    formatValue,
} from "@/styles/charts";

import type { TradeByCategoryItem } from "@/types/visualization-data/russia-trade";
import type { TreemapNode } from "recharts/types/util/types";

interface CategoryTreemapProps {
    label: string;
    datasetName: string;
    selectedYear: string;
}

const BLN = 1_000_000_000;

export const CategoryTreemap = ({ label, datasetName, selectedYear }: CategoryTreemapProps) => {
    const { data } = useGetVisualizationDatasetQuery(datasetName);
    const categoryItems = (data ?? []) as TradeByCategoryItem[];

    const { treemapData, treemapTotal } = useMemo(() => {
        const year = Number(selectedYear);
        const items = categoryItems
            .filter((d) => d.year === year)
            .map((d) => ({
                name: d.product_category,
                value: d.value / BLN,
            }));
        const total = items.reduce((sum, d) => sum + d.value, 0);
        return {
            treemapData: items.map((d) => ({ ...d, _total: total })),
            treemapTotal: total,
        };
    }, [categoryItems, selectedYear]);

    if (treemapData.length === 0) {
        return (
            <div>
                <ChartTitle>{label} by Category</ChartTitle>
                <ChartPlaceholder height={CHART_HEIGHT} />
            </div>
        );
    }

    return (
        <div>
            <ChartTitle>{label} by Category</ChartTitle>
            <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
                <Treemap
                    data={treemapData}
                    nameKey="name"
                    dataKey="value"
                    type="flat"
                    colorPanel={CHART_COLORS as unknown as []}
                    content={
                        <TradeTreemapCell
                            _total={treemapTotal}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            {...({} as any)}
                        />
                    }
                >
                    <Tooltip
                        content={ChartTooltip}
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        formatter={treemapFormatter as any}
                    />
                </Treemap>
            </ResponsiveContainer>
        </div>
    );
};

// ── Treemap custom cell ──────────────────────────────────────────────────

interface TreemapContentProps extends TreemapNode {
    _total: number;
}

const TradeTreemapCell = (props: TreemapContentProps) => {
    const { x, y, width, height, name, value, _total, index } = props;
    const fill = CHART_COLORS[index % CHART_COLORS.length];
    const share = _total > 0 ? (value / _total) * 100 : 0;

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
                {formatValue(value, "bln USD")} ({share.toFixed(1)}%)
            </text>
        </g>
    );
};

// ── Treemap tooltip formatter ────────────────────────────────────────────

const treemapFormatter = (
    v: number,
    _name: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any,
): string => {
    const share =
        props.payload?._total > 0
            ? (v / props.payload._total) * 100
            : 0;
    return `${formatValue(v, "bln USD")} (${share.toFixed(1)}%)`;
};
