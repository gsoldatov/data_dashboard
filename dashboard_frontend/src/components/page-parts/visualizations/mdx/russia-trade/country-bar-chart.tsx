import { useMemo } from "react";
import { useGetVisualizationDatasetQuery } from "@/store/backend-api-slices/visualization-data";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { ChartPlaceholder } from "@/components/common/visualizations/charts/chart-placeholder";
import { ChartTitle } from "@/components/common/visualizations/charts/chart-title";
import { axisTooltipContent } from "@/components/common/visualizations/charts/chart-tooltip";
import {
    CHART_HEIGHT,
    CHART_MARGINS,
    GRID_STROKE_DASHARRAY,
    GRID_STROKE,
    CHART_COLORS,
    formatScaledValue,
} from "@/styles/charts";

import type { TradeByCountryItem } from "@/types/visualization-data/russia-trade";

interface CountryBarChartProps {
    flow: "exports" | "imports";
    selectedYear: string;
}

const BLN = 1_000_000_000;
const BAR_HEIGHT = 25;
const VISIBLE_BARS = 15;

export const CountryBarChart = ({ flow, selectedYear }: CountryBarChartProps) => {
    const isExports = flow === "exports";
    const label = isExports ? "Exports" : "Imports";
    const countryDataset = isExports
        ? "russia_trade_exports_by_country"
        : "russia_trade_imports_by_country";

    const { data } = useGetVisualizationDatasetQuery(countryDataset);
    const countryItems = (data ?? []) as TradeByCountryItem[];

    const chartData = useMemo(() => {
        const year = Number(selectedYear);
        return countryItems
            .filter((d) => d.year === year)
            .map((d) => ({
                country: d.country,
                value: d.value / BLN,
                _raw: d.value,
            }))
            .sort((a, b) => b.value - a.value);
    }, [countryItems, selectedYear]);

    if (chartData.length === 0) {
        return (
            <div>
                <ChartTitle>{label} by Country</ChartTitle>
                <ChartPlaceholder height={CHART_HEIGHT} />
            </div>
        );
    }

    const chartHeight = Math.max(CHART_HEIGHT, chartData.length * BAR_HEIGHT);

    return (
        <div>
            <ChartTitle>{label} by Country</ChartTitle>
            <div
                style={{
                    maxHeight: VISIBLE_BARS * BAR_HEIGHT,
                    overflowY: "auto",
                }}
            >
                <ResponsiveContainer width="100%" height={chartHeight}>
                    <BarChart
                        data={chartData}
                        margin={CHART_MARGINS}
                        layout="vertical"
                    >
                        <CartesianGrid
                            stroke={GRID_STROKE}
                            strokeDasharray={GRID_STROKE_DASHARRAY}
                            horizontal={false}
                        />
                        <XAxis
                            type="number"
                            tickFormatter={(v: number) => v.toFixed(0)}
                        />
                        <YAxis
                            type="category"
                            dataKey="country"
                            width={120}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            content={axisTooltipContent("country", "Country")}
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            formatter={(_v, _name, entry: any) =>
                                formatScaledValue(
                                    entry.payload._raw,
                                    "USD",
                                )
                            }
                        />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {chartData.map((_, i) => (
                                <Cell
                                    key={i}
                                    fill={
                                        CHART_COLORS[
                                            i % CHART_COLORS.length
                                        ]
                                    }
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
